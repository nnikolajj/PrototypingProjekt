<script>
	import PageHeader from '#lib/components/PageHeader.svelte';
	import MovieGrid from '#lib/components/MovieGrid.svelte';

	let { data } = $props();
</script>

<svelte:head><title>{data.genre.name} · Bragirium</title></svelte:head>

<PageHeader
	title={data.genre.name}
	subtitle="Die beliebtesten Filme im Genre {data.genre.name}."
	crumbs={[
		{ label: 'Startseite', href: '/' },
		{ label: 'Genres', href: '/genres' },
		{ label: data.genre.name }
	]}
/>

<MovieGrid movies={data.movies} />

<nav class="pager">
	{#if data.page > 1}
		<a class="btn btn-ghost" href="?seite={data.page - 1}">‹ Zurück</a>
	{/if}
	<span class="muted">Seite {data.page} von {data.totalPages}</span>
	{#if data.page < data.totalPages}
		<a class="btn btn-ghost" href="?seite={data.page + 1}">Weiter ›</a>
	{/if}
</nav>

<style>
	.pager {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin-top: 3rem;
	}
</style>
