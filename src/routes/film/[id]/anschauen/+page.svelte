<script>
	import Breadcrumb from '#lib/components/Breadcrumb.svelte';
	import { img } from '#lib/tmdb-image.js';

	let { data } = $props();
	const m = $derived(data.movie);
	const genre = $derived(m.genres[0]);
	const p = $derived(m.providers);

	let lightsOff = $state(false);

	const groups = $derived(
		p
			? [
					{ label: 'Im Abo', items: p.flatrate },
					{ label: 'Leihen', items: p.rent },
					{ label: 'Kaufen', items: p.buy }
				].filter((g) => g.items.length)
			: []
	);
</script>

<svelte:head><title>{m.title} anschauen · Bragirium</title></svelte:head>

<div class="dimmer" class:on={lightsOff}></div>

<Breadcrumb
	items={[
		{ label: 'Startseite', href: '/' },
		...(genre ? [{ label: genre.name, href: `/genres/${genre.id}` }] : []),
		{ label: m.title, href: `/film/${m.id}` },
		{ label: 'Anschauen' }
	]}
/>

<div class="head">
	<h1>{m.title}</h1>
	<button
		class="btn btn-ghost lamp"
		class:active={lightsOff}
		onclick={() => (lightsOff = !lightsOff)}
		title={lightsOff ? 'Licht an' : 'Licht aus'}
		aria-pressed={lightsOff}
	>
		💡 {lightsOff ? 'Licht an' : 'Licht aus'}
	</button>
</div>

<div class="player glass" class:spot={lightsOff}>
	{#if m.trailerKey}
		<iframe
			src="https://www.youtube-nocookie.com/embed/{m.trailerKey}?autoplay=1"
			title="Trailer: {m.title}"
			allow="autoplay; accelerometer; encrypted-media; gyroscope; picture-in-picture"
			allowfullscreen
		></iframe>
	{:else if m.backdrop}
		<img src={img(m.backdrop, 'w1280')} alt="" />
	{/if}
</div>

<section class="where glass">
	<h2 class="section-title">Wo kann ich den ganzen Film schauen?</h2>
	{#if groups.length}
		{#each groups as g}
			<div class="group">
				<span class="label muted">{g.label}</span>
				<div class="logos">
					{#each g.items as prov (prov.provider_id)}
						<a href={p?.link} target="_blank" rel="noreferrer" class="prov" title={prov.provider_name}>
							<img src={img(prov.logo_path, 'w92')} alt={prov.provider_name} />
						</a>
					{/each}
				</div>
			</div>
		{/each}
		<p class="credit muted">Streaming-Daten von JustWatch via TMDB (Region Schweiz).</p>
	{:else}
		<p class="muted">Aktuell bei keinem Anbieter in der Schweiz verfügbar.</p>
	{/if}
</section>

<style>
	.dimmer {
		position: fixed;
		inset: 0;
		background: black;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.5s;
		z-index: 40;
	}

	.dimmer.on {
		opacity: 0.88;
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	h1 {
		font-size: clamp(2rem, 4vw, 2.8rem);
	}

	.lamp {
		position: relative;
		z-index: 45;
	}

	.lamp.active {
		border-color: #ffd60a;
		box-shadow: 0 0 24px rgba(255, 214, 10, 0.35);
	}

	.player {
		position: relative;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		padding: 0;
	}

	.player.spot {
		z-index: 45;
		box-shadow: 0 0 120px rgba(10, 132, 255, 0.25);
	}

	.player iframe,
	.player img {
		width: 100%;
		height: 100%;
		border: 0;
		object-fit: cover;
	}

	.where {
		margin-top: 2rem;
		padding: 1.5rem;
	}

	.group {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.label {
		width: 70px;
		font-size: 0.85rem;
	}

	.logos {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}

	.prov img {
		width: 48px;
		height: 48px;
		border-radius: 12px;
		transition: transform 0.2s;
	}

	.prov:hover img {
		transform: scale(1.08);
	}

	.credit {
		font-size: 0.75rem;
		margin: 0.5rem 0 0;
	}
</style>
