<script>
	import SearchBar from '#lib/components/SearchBar.svelte';
	import MovieCard from '#lib/components/MovieCard.svelte';
	import MovieMap from '#lib/components/MovieMap.svelte';

	let { data } = $props();

	const today = new Date().toLocaleDateString('de-CH', {
		weekday: 'long',
		day: 'numeric',
		month: 'long'
	});

	const tiles = [
		{ href: '/genres', label: 'Genres', sub: 'Nach Stimmung stöbern', icon: '🎭' },
		{ href: '/top-100', label: 'Top 100', sub: 'Die bestbewerteten Filme', icon: '🏆' },
		{ href: '/neuste', label: 'Neuste', sub: 'Gerade im Kino', icon: '✨' }
	];
</script>

<section class="hero">
	<h1>Was schauen wir heute?</h1>
	<p class="muted">Entdecke Filme, finde Ähnliches und lass dich inspirieren.</p>
	<div class="search-wrap"><SearchBar /></div>
</section>

<div class="layout">
	<aside class="tiles" aria-label="Kategorien">
		{#each tiles as t}
			<a href={t.href} class="tile glass">
				<span class="icon">{t.icon}</span>
				<span class="text">
					<strong>{t.label}</strong>
					<small>{t.sub}</small>
				</span>
				<span class="chev">›</span>
			</a>
		{/each}
	</aside>

	<div class="content">
		<section>
			<h2 class="section-title">
				Heutige Auswahl <span class="pill">{today}</span>
			</h2>
			<p class="muted lead">
				Wie im Fernsehen: {data.picks.length} Filme aus {data.picks.length} Genres – du wählst nur noch.
				Morgen gibt's ein neues Programm.
			</p>
			<ol class="picks">
				{#each data.picks as movie (movie.id)}
					<li class="slot" class:prime={movie.slot === '20:15'}>
						<div class="slot-head">
							<time>{movie.slot}</time>
							<span class="genre">{movie.genre}</span>
						</div>
						<MovieCard {movie} />
					</li>
				{/each}
			</ol>
		</section>

		<section class="map-section">
			<h2 class="section-title">Film-Map</h2>
			<p class="muted lead">
				Filme, die Fans von <strong>{data.picks[0]?.title}</strong> auch mögen – je näher, desto ähnlicher.
			</p>
			{#await data.map}
				<div class="map-skeleton glass">Map wird geladen …</div>
			{:then map}
				{#if map}<MovieMap data={map} />{/if}
			{:catch}
				<div class="map-skeleton glass">Map konnte nicht geladen werden.</div>
			{/await}
		</section>
	</div>
</div>

<style>
	.hero {
		text-align: center;
		padding: 2rem 0 3rem;
	}

	.hero h1 {
		font-size: clamp(2.2rem, 5vw, 3.5rem);
		font-weight: 700;
		background: linear-gradient(180deg, #fff 30%, #9fb7d6);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	.hero p {
		margin: 0.75rem 0 2rem;
		font-size: 1.1rem;
	}

	.search-wrap {
		max-width: 640px;
		margin-inline: auto;
	}

	/* Kacheln rechts, Inhalt in der Mitte. Für Kacheln links: "tiles content" tauschen. */
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 260px;
		grid-template-areas: 'content tiles';
		gap: 2rem;
		align-items: start;
	}

	.content {
		grid-area: content;
		display: flex;
		flex-direction: column;
		gap: 3rem;
	}

	.tiles {
		grid-area: tiles;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		position: sticky;
		top: 88px;
	}

	.tile {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding: 1.1rem 1.2rem;
		transition:
			transform 0.2s,
			background 0.2s,
			border-color 0.2s;
	}

	.tile:hover {
		transform: translateY(-2px);
		background: var(--glass-strong);
		border-color: rgba(10, 132, 255, 0.5);
	}

	.icon {
		width: 42px;
		height: 42px;
		border-radius: 12px;
		display: grid;
		place-items: center;
		font-size: 1.3rem;
		background: var(--accent-soft);
		flex-shrink: 0;
	}

	.text {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.text small {
		color: var(--text-dim);
		font-size: 0.8rem;
		margin-top: 0.1rem;
	}

	.chev {
		font-size: 1.5rem;
		color: var(--text-faint);
	}

	.picks {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: 1.25rem;
	}

	.slot {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	/* Programmzeile über dem Poster: Sendezeit + Genre ("Sender") */
	.slot-head {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		padding-bottom: 0.45rem;
		border-bottom: 1px solid var(--glass-border);
	}

	.slot-head time {
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.01em;
	}

	.genre {
		font-size: 0.75rem;
		color: var(--text-dim);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* 20:15 = Primetime, wie im TV hervorgehoben */
	.prime .slot-head {
		border-bottom-color: var(--accent);
	}

	.prime .slot-head time {
		color: var(--accent);
	}

	.lead {
		margin: -0.5rem 0 1rem;
	}

	.map-skeleton {
		height: 420px;
		display: grid;
		place-items: center;
		color: var(--text-dim);
	}

	@media (max-width: 900px) {
		.layout {
			grid-template-columns: 1fr;
			grid-template-areas: 'tiles' 'content';
		}
		.tiles {
			position: static;
			flex-direction: row;
			overflow-x: auto;
		}
		.tile {
			flex: 1 0 200px;
		}
	}

	/* Schmal: Programm seitlich wischen statt 5 winzige Poster */
	@media (max-width: 720px) {
		.picks {
			grid-template-columns: none;
			grid-auto-flow: column;
			grid-auto-columns: 42%;
			overflow-x: auto;
			scroll-snap-type: x mandatory;
			padding-bottom: 0.5rem;
		}
		.slot {
			scroll-snap-align: start;
		}
	}
</style>
