<!--
	Schwebende Suchleiste für die Film-Map (Glass-Stil).
	Zeigt zuerst Treffer, die schon auf der Map sind (→ hinfliegen),
	danach weitere Filme von TMDB (→ Map neu um diesen Film aufbauen).
-->
<script>
	import { img } from '#lib/tmdb-image.js';

	/** @typedef {{id:number,title:string,poster:string|null,year:string}} Hit */

	/** @type {{ nodes: Hit[], onpick: (pick: { id: number, onMap: boolean }) => void }} */
	let { nodes, onpick } = $props();

	let query = $state('');
	let open = $state(false);
	let active = $state(0);
	let searching = $state(false);
	/** @type {Hit[]} */
	let remote = $state([]);
	/** @type {HTMLInputElement | undefined} */
	let input = $state();

	/** Normalisiert für tolerante Suche: "Amélie" findet auch "amelie". */
	/** @param {string} s */
	const norm = (s) =>
		s
			.toLowerCase()
			.normalize('NFD')
			.replace(/[̀-ͯ]/g, '');

	const onMap = $derived.by(() => {
		const q = norm(query.trim());
		if (q.length < 2) return [];
		return nodes.filter((n) => norm(n.title).includes(q)).slice(0, 4);
	});

	const more = $derived(remote.filter((m) => !onMap.some((n) => n.id === m.id)).slice(0, 5));

	/** Alle Einträge in Anzeigereihenfolge, für die Pfeiltasten-Navigation */
	const items = $derived([
		...onMap.map((m) => ({ ...m, onMap: true })),
		...more.map((m) => ({ ...m, onMap: false }))
	]);

	// TMDB-Suche mit kurzer Verzögerung, damit nicht bei jedem Tastendruck gefragt wird
	$effect(() => {
		const q = query.trim();
		active = 0;
		if (q.length < 2) {
			remote = [];
			searching = false;
			return;
		}
		searching = true;
		const ctrl = new AbortController();
		const timer = setTimeout(async () => {
			try {
				const res = await fetch(`/api/suche?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
				if (res.ok) remote = await res.json();
			} catch {
				/* abgebrochen oder offline – einfach keine Vorschläge */
			} finally {
				if (!ctrl.signal.aborted) searching = false;
			}
		}, 250);
		return () => {
			clearTimeout(timer);
			ctrl.abort();
		};
	});

	/** @param {{id:number, onMap:boolean}} item */
	function pick(item) {
		onpick({ id: item.id, onMap: item.onMap });
		query = '';
		open = false;
		input?.blur();
	}

	/** @param {KeyboardEvent} e */
	function onKey(e) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			active = Math.min(active + 1, items.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			active = Math.max(active - 1, 0);
		} else if (e.key === 'Enter' && items[active]) {
			e.preventDefault();
			pick(items[active]);
		} else if (e.key === 'Escape') {
			query = '';
			input?.blur();
		}
	}

	const showList = $derived(open && query.trim().length >= 2);
</script>

<div class="search" class:expanded={showList}>
	<label class="field">
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
			<path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
		</svg>
		<input
			bind:this={input}
			bind:value={query}
			onfocus={() => (open = true)}
			onblur={() => setTimeout(() => (open = false), 120)}
			onkeydown={onKey}
			placeholder="Film auf der Map suchen"
			aria-label="Film auf der Map suchen"
			role="combobox"
			aria-expanded={showList}
			aria-controls="map-search-list"
			aria-autocomplete="list"
			autocomplete="off"
			spellcheck="false"
		/>
		{#if query}
			<button
				class="clear"
				type="button"
				aria-label="Suche leeren"
				onmousedown={(e) => e.preventDefault()}
				onclick={() => (query = '')}>×</button
			>
		{/if}
	</label>

	{#if showList}
		<div class="list" id="map-search-list" role="listbox">
			{#if onMap.length}
				<p class="group">Auf der Map</p>
				{#each onMap as m, i (m.id)}
					{@render row(m, i, true)}
				{/each}
			{/if}
			{#if more.length}
				<p class="group">Neue Map starten mit …</p>
				{#each more as m, i (m.id)}
					{@render row(m, onMap.length + i, false)}
				{/each}
			{/if}
			{#if !items.length}
				<p class="empty">{searching ? 'Suche …' : 'Kein Film gefunden'}</p>
			{/if}
		</div>
	{/if}
</div>

{#snippet row(/** @type {Hit} */ m, /** @type {number} */ i, /** @type {boolean} */ isOnMap)}
	<button
		type="button"
		class="item"
		class:active={i === active}
		role="option"
		aria-selected={i === active}
		onmousedown={(e) => e.preventDefault()}
		onmouseenter={() => (active = i)}
		onclick={() => pick({ id: m.id, onMap: isOnMap })}
	>
		<span class="thumb">
			{#if m.poster}<img src={img(m.poster, 'w92')} alt="" loading="lazy" />{/if}
		</span>
		<span class="text">
			<span class="title">{m.title}</span>
			{#if m.year}<span class="year">{m.year}</span>{/if}
		</span>
		<span class="badge" class:here={isOnMap}>{isOnMap ? 'Hinfliegen' : 'Neu'}</span>
	</button>
{/snippet}

<style>
	.search {
		width: min(320px, calc(100vw - 7rem));
		border-radius: 22px;
		background: rgba(30, 34, 44, 0.55);
		border: 1px solid rgba(255, 255, 255, 0.14);
		backdrop-filter: blur(28px) saturate(180%);
		-webkit-backdrop-filter: blur(28px) saturate(180%);
		box-shadow:
			0 10px 40px rgba(0, 0, 0, 0.45),
			inset 0 1px 0 rgba(255, 255, 255, 0.08);
		overflow: hidden;
		transition:
			border-color 0.2s,
			box-shadow 0.2s,
			background 0.2s;
	}

	/* Offene Liste: dichteres Glas, damit die Treffer gut lesbar sind */
	.search.expanded {
		background: rgba(24, 28, 37, 0.86);
	}

	.search:focus-within {
		border-color: rgba(10, 132, 255, 0.6);
		box-shadow:
			0 10px 40px rgba(0, 0, 0, 0.45),
			0 0 0 4px var(--accent-soft);
	}

	.field {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0 0.6rem 0 0.95rem;
		height: 44px;
		color: var(--text-dim);
	}

	input {
		flex: 1;
		min-width: 0;
		font: inherit;
		font-size: 0.92rem;
		color: var(--text);
		background: none;
		border: 0;
		outline: none;
	}

	input::placeholder {
		color: var(--text-faint);
	}

	.clear {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border: 0;
		background: rgba(255, 255, 255, 0.12);
		color: var(--text);
		font-size: 1rem;
		line-height: 1;
		cursor: pointer;
	}

	.list {
		max-height: 340px;
		overflow-y: auto;
		padding: 0.25rem 0.4rem 0.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.group {
		margin: 0.55rem 0.55rem 0.25rem;
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--text-faint);
	}

	.item {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		width: 100%;
		padding: 0.4rem 0.55rem;
		border: 0;
		border-radius: 12px;
		background: none;
		color: var(--text);
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.item.active {
		background: rgba(255, 255, 255, 0.1);
	}

	.thumb {
		width: 30px;
		height: 44px;
		border-radius: 6px;
		overflow: hidden;
		flex-shrink: 0;
		background: var(--bg-elev);
	}

	.thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.text {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	.title {
		font-size: 0.88rem;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.year {
		font-size: 0.75rem;
		color: var(--text-dim);
	}

	.badge {
		font-size: 0.68rem;
		font-weight: 600;
		padding: 0.2rem 0.5rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.08);
		color: var(--text-dim);
		flex-shrink: 0;
	}

	.badge.here {
		background: var(--accent-soft);
		color: #6cb6ff;
	}

	.empty {
		margin: 0.75rem;
		font-size: 0.85rem;
		color: var(--text-dim);
	}
</style>
