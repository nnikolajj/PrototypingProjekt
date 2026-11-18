<script>
	import SearchBar from '#lib/components/SearchBar.svelte';
	import MovieGrid from '#lib/components/MovieGrid.svelte';
	import Breadcrumb from '#lib/components/Breadcrumb.svelte';

	let { data } = $props();
</script>

<svelte:head><title>Suche: {data.q} · Bragirium</title></svelte:head>

<Breadcrumb items={[{ label: 'Startseite', href: '/' }, { label: 'Suche' }]} />
<div class="bar"><SearchBar value={data.q} autofocus={!data.q} /></div>

{#if data.q}
	<h1 class="section-title">{data.movies.length} Ergebnisse für «{data.q}»</h1>
	<MovieGrid movies={data.movies} />
{/if}

<style>
	.bar {
		max-width: 640px;
		margin-bottom: 2.5rem;
	}
</style>
