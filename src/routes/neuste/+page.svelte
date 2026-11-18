<script>
	import PageHeader from '#lib/components/PageHeader.svelte';
	import MovieGrid from '#lib/components/MovieGrid.svelte';

	let { data } = $props();
</script>

<svelte:head><title>Neuste · Bragirium</title></svelte:head>

<PageHeader
	title="Neuste Filme"
	subtitle="Aktuell im Kino."
	crumbs={[{ label: 'Startseite', href: '/' }, { label: 'Neuste' }]}
/>
<MovieGrid movies={data.movies} />
