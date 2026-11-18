<script>
	import MovieCard from './MovieCard.svelte';

	/** @type {{ movies: any[], ranked?: boolean }} */
	let { movies, ranked = false } = $props();
</script>

{#if movies.length}
	<div class="grid">
		{#each movies as movie, i (movie.id)}
			<MovieCard {movie} rank={ranked ? i + 1 : undefined} />
		{/each}
	</div>
{:else}
	<p class="muted">Keine Filme gefunden.</p>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 1.5rem 1.25rem;
	}
</style>
