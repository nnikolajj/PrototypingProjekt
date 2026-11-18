<script>
	import PageHeader from '#lib/components/PageHeader.svelte';
	import MovieGrid from '#lib/components/MovieGrid.svelte';

	let { data } = $props();
</script>

<svelte:head><title>Top 100 · Bragirium</title></svelte:head>

<PageHeader
	title="Top 100"
	subtitle="Die bestbewerteten Filme aller Zeiten laut TMDB-Community."
	crumbs={[{ label: 'Startseite', href: '/' }, { label: 'Top 100' }]}
/>
<MovieGrid movies={data.movies} ranked />
