<script>
	import Breadcrumb from '#lib/components/Breadcrumb.svelte';
	import MovieGrid from '#lib/components/MovieGrid.svelte';
	import { img } from '#lib/tmdb-image.js';

	let { data } = $props();
	const m = $derived(data.movie);
	const genre = $derived(m.genres[0]);
	const watchHref = $derived(
		data.user ? `/film/${m.id}/anschauen` : `/login?weiter=/film/${m.id}/anschauen`
	);

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
		<a href={watchHref} class="btn btn-primary watch">▶ Anschauen <span aria-hidden="true">☆</span></a>
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

	.block {
		margin-top: 3.5rem;
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
