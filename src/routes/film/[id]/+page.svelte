<script>
	import Breadcrumb from '#lib/components/Breadcrumb.svelte';
	import MovieGrid from '#lib/components/MovieGrid.svelte';
	import MovieMap from '#lib/components/MovieMap.svelte';
	import { img } from '#lib/tmdb-image.js';

	let { data } = $props();
	const m = $derived(data.movie);
	const genre = $derived(m.genres[0]);
	const watchHref = $derived(
		data.user ? `/film/${m.id}/anschauen` : `/login?weiter=/film/${m.id}/anschauen`
	);
	// Schauen dürfen nur Friends und Admins; normale User sehen den Button gesperrt.
	const watchLocked = $derived(!!data.user && !['friend', 'admin'].includes(data.user.role));

	// Film-Map: wird erst beim Aufklappen geladen (spart ~17 TMDB-Anfragen pro Seitenaufruf)
	let mapOpen = $state(false);
	/** @type {Promise<any> | null} */
	let mapData = $state(null);

	/** @param {Event & { currentTarget: HTMLDetailsElement }} e */
	function toggleMap(e) {
		mapOpen = e.currentTarget.open;
		if (mapOpen && !mapData) {
			mapData = fetch(`/api/map/${m.id}`).then((r) => {
				if (!r.ok) throw new Error('Map konnte nicht geladen werden');
				return r.json();
			});
		}
	}

	// Beim Wechsel zu einem anderen Film wieder zuklappen
	$effect.pre(() => {
		m.id;
		mapOpen = false;
		mapData = null;
	});

	/** @param {number} min */
	const runtime = (min) => (min ? `${Math.floor(min / 60)} h ${min % 60} min` : null);
</script>

<svelte:head><title>{m.title} · Bragirium</title></svelte:head>

{#if m.backdrop}
	<div class="backdrop" style="background-image: url({img(m.backdrop, 'w1280')})"></div>
{/if}

<Breadcrumb
	items={[
		{ label: 'Startseite', href: '/' },
		...(genre ? [{ label: genre.name, href: `/genres/${genre.id}` }] : []),
		{ label: m.title }
	]}
/>

<h1 class="title">{m.title}</h1>
{#if m.tagline}<p class="tagline">{m.tagline}</p>{/if}

<div class="main">
	<div class="poster">
		{#if m.poster}
			<img src={img(m.poster, 'w500')} alt="Poster: {m.title}" />
		{/if}
	</div>

	<section class="infos glass">
		<h2 class="section-title">Infos</h2>
		<dl>
			{#if m.releaseDate}
				<dt>Erschienen</dt>
				<dd>{new Date(m.releaseDate).toLocaleDateString('de-CH')}</dd>
			{/if}
			{#if m.runtime}<dt>Dauer</dt><dd>{runtime(m.runtime)}</dd>{/if}
			{#if m.director}<dt>Regie</dt><dd>{m.director}</dd>{/if}
			<dt>Bewertung</dt>
			<dd><span class="star">★</span> {m.rating.toFixed(1)} <span class="muted">({m.voteCount} Stimmen)</span></dd>
			<dt>Genres</dt>
			<dd class="chips">
				{#each m.genres as g (g.id)}<a class="pill" href="/genres/{g.id}">{g.name}</a>{/each}
			</dd>
		</dl>
		{#if m.overview}<p class="overview">{m.overview}</p>{/if}
	</section>

	<section class="trailer">
		<h2 class="section-title">Trailer</h2>
		<div class="video glass">
			{#if m.trailerKey}
				<iframe
					src="https://www.youtube-nocookie.com/embed/{m.trailerKey}"
					title="Trailer: {m.title}"
					allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
					allowfullscreen
				></iframe>
			{:else}
				<div class="no-video muted">Kein Trailer verfügbar</div>
			{/if}
		</div>
		{#if watchLocked}
			<button class="btn btn-primary watch" disabled aria-describedby="watch-note">
				▶ Anschauen <span aria-hidden="true">☆</span>
			</button>
			<p id="watch-note" class="watch-note">
				🔒 Filme schauen können nur <strong>Friends</strong>. Frag einen Admin, ob er dich freischaltet.
			</p>
		{:else}
			<a href={watchHref} class="btn btn-primary watch">▶ Anschauen <span aria-hidden="true">☆</span></a>
		{/if}
	</section>
</div>

{#if m.cast.length}
	<section class="block">
		<h2 class="section-title">Besetzung</h2>
		<div class="cast">
			{#each m.cast as c}
				<div class="person">
					<div class="avatar">
						{#if c.profile}<img src={img(c.profile, 'w185')} alt={c.name} loading="lazy" />{/if}
					</div>
					<strong>{c.name}</strong>
					<small class="muted">{c.character}</small>
				</div>
			{/each}
		</div>
	</section>
{/if}

<details class="map-panel" open={mapOpen} ontoggle={toggleMap}>
	<summary>
		<span class="map-icon" aria-hidden="true">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
				<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8" />
				<circle cx="4.5" cy="6" r="2" stroke="currentColor" stroke-width="1.6" />
				<circle cx="19.5" cy="7" r="2" stroke="currentColor" stroke-width="1.6" />
				<circle cx="18" cy="19" r="2" stroke="currentColor" stroke-width="1.6" />
				<path d="M6.3 7.1 9.5 10M17.8 8.2l-3.4 2.5M16.6 17.5l-2.5-3.2" stroke="currentColor" stroke-width="1.6" />
			</svg>
		</span>
		<span class="map-text">
			<strong>Film-Map</strong>
			<small>Entdecke, was mit „{m.title}“ verwandt ist – je näher, desto ähnlicher</small>
		</span>
		<span class="chev" aria-hidden="true">›</span>
	</summary>
	<div class="map-body">
		{#if mapData}
			{#await mapData}
				<div class="map-skeleton glass">Map wird geladen …</div>
			{:then map}
				<MovieMap data={map} />
			{:catch}
				<div class="map-skeleton glass">Map konnte nicht geladen werden.</div>
			{/await}
		{/if}
	</div>
</details>

{#if m.recommendations.length}
	<section class="block">
		<h2 class="section-title">Das könnte dir auch gefallen</h2>
		<MovieGrid movies={m.recommendations} />
	</section>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: -1;
		background-size: cover;
		background-position: center top;
		opacity: 0.18;
		mask-image: linear-gradient(to bottom, black 0%, transparent 75%);
		-webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 75%);
		filter: blur(2px);
	}

	.title {
		font-size: clamp(2.2rem, 5vw, 3.4rem);
		font-weight: 700;
	}

	.tagline {
		color: var(--text-dim);
		font-style: italic;
		margin: 0.4rem 0 0;
	}

	.main {
		display: grid;
		grid-template-columns: 260px minmax(0, 1fr) minmax(0, 1.2fr);
		gap: 1.75rem;
		margin-top: 2rem;
		align-items: start;
	}

	.poster img {
		width: 100%;
		border-radius: var(--radius);
		border: 1px solid var(--glass-border);
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
	}

	.infos {
		padding: 1.5rem;
	}

	dl {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.6rem 1rem;
		margin: 0;
		font-size: 0.92rem;
	}

	dt {
		color: var(--text-dim);
	}

	dd {
		margin: 0;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.star {
		color: #ffd60a;
	}

	.overview {
		line-height: 1.6;
		margin: 1.25rem 0 0;
		color: #d4d4d8;
	}

	.video {
		aspect-ratio: 16 / 9;
		overflow: hidden;
		padding: 0;
	}

	iframe {
		width: 100%;
		height: 100%;
		border: 0;
		display: block;
	}

	.no-video {
		height: 100%;
		display: grid;
		place-items: center;
	}

	.watch {
		width: 100%;
		margin-top: 1.25rem;
		padding-block: 1rem;
		font-size: 1.05rem;
	}

	.watch:disabled {
		opacity: 0.45;
		cursor: not-allowed;
		box-shadow: none;
		filter: saturate(0.4);
	}

	.watch:disabled:hover {
		background: var(--accent);
		transform: none;
	}

	.watch-note {
		margin: 0.65rem 0 0;
		font-size: 0.85rem;
		color: var(--text-dim);
		text-align: center;
	}

	.block {
		margin-top: 3.5rem;
	}

	/* Aufklappbare Map im Glass-Stil */
	.map-panel {
		margin-top: 3.5rem;
		border-radius: var(--radius);
		background: var(--glass);
		border: 1px solid var(--glass-border);
		backdrop-filter: var(--blur);
		-webkit-backdrop-filter: var(--blur);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
		overflow: hidden;
	}

	summary {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding: 1rem 1.25rem;
		cursor: pointer;
		list-style: none;
		transition: background 0.2s;
	}

	summary::-webkit-details-marker {
		display: none;
	}

	summary:hover {
		background: rgba(255, 255, 255, 0.04);
	}

	.map-icon {
		width: 40px;
		height: 40px;
		border-radius: 12px;
		display: grid;
		place-items: center;
		flex-shrink: 0;
		color: #6cb6ff;
		background: var(--accent-soft);
	}

	.map-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.map-text small {
		color: var(--text-dim);
		font-size: 0.82rem;
	}

	.chev {
		font-size: 1.5rem;
		color: var(--text-faint);
		transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.map-panel[open] .chev {
		transform: rotate(90deg);
	}

	.map-body {
		padding: 0 0.75rem 0.75rem;
	}

	.map-panel[open] .map-body {
		animation: reveal 0.35s cubic-bezier(0.22, 1, 0.36, 1);
	}

	@keyframes reveal {
		from {
			opacity: 0;
			transform: translateY(-6px);
		}
	}

	.map-skeleton {
		height: 440px;
		display: grid;
		place-items: center;
		color: var(--text-dim);
	}

	.cast {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
		gap: 1.25rem;
	}

	.person {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 0.25rem;
		font-size: 0.85rem;
	}

	.avatar {
		width: 84px;
		height: 84px;
		border-radius: 50%;
		overflow: hidden;
		background: var(--bg-elev);
		border: 1px solid var(--glass-border);
		margin-bottom: 0.35rem;
	}

	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	@media (max-width: 1000px) {
		.main {
			grid-template-columns: 200px 1fr;
		}
		.trailer {
			grid-column: 1 / -1;
		}
	}

	@media (max-width: 600px) {
		.main {
			grid-template-columns: 1fr;
		}
		.poster {
			max-width: 220px;
		}
	}
</style>
