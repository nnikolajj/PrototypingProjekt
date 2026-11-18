<script>
	import PageHeader from '#lib/components/PageHeader.svelte';

	let { data } = $props();
</script>

<svelte:head><title>Genres · Bragirium</title></svelte:head>

<PageHeader
	title="Genres"
	subtitle="Wähle eine Stimmung."
	crumbs={[{ label: 'Startseite', href: '/' }, { label: 'Genres' }]}
/>

<div class="grid">
	{#each data.genres as g (g.id)}
		<a href="/genres/{g.id}" class="genre glass">{g.name}</a>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 1rem;
	}

	.genre {
		padding: 1.6rem 1.2rem;
		font-weight: 600;
		font-size: 1.05rem;
		transition: transform 0.2s, background 0.2s, border-color 0.2s;
	}

	.genre:hover {
		transform: translateY(-2px);
		background: var(--glass-strong);
		border-color: rgba(10, 132, 255, 0.5);
	}
</style>
