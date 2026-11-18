<script>
	import { img } from '#lib/tmdb-image.js';

	/** @type {{ movie: {id:number,title:string,poster:string|null,year:string,rating:number}, rank?: number }} */
	let { movie, rank } = $props();
</script>

<a href="/film/{movie.id}" class="card">
	<div class="poster">
		{#if movie.poster}
			<img src={img(movie.poster, 'w342')} alt="Poster: {movie.title}" loading="lazy" />
		{:else}
			<div class="placeholder">🎬</div>
		{/if}
		{#if rank}<span class="rank">{rank}</span>{/if}
		{#if movie.rating}
			<span class="rating">★ {movie.rating.toFixed(1)}</span>
		{/if}
	</div>
	<div class="meta">
		<span class="title">{movie.title}</span>
		{#if movie.year}<span class="year">{movie.year}</span>{/if}
	</div>
</a>

<style>
	.card {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.poster {
		position: relative;
		aspect-ratio: 2 / 3;
		border-radius: var(--radius-sm);
		overflow: hidden;
		background: var(--bg-elev);
		border: 1px solid var(--glass-border);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
		transition:
			transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
			box-shadow 0.3s;
	}

	.card:hover .poster {
		transform: translateY(-4px) scale(1.02);
		box-shadow:
			0 18px 40px rgba(0, 0, 0, 0.5),
			0 0 0 1px rgba(10, 132, 255, 0.5);
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.placeholder {
		height: 100%;
		display: grid;
		place-items: center;
		font-size: 2.5rem;
		opacity: 0.4;
	}

	.rating,
	.rank {
		position: absolute;
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.25rem 0.55rem;
		border-radius: 999px;
		background: rgba(0, 0, 0, 0.55);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.15);
	}

	.rating {
		right: 8px;
		bottom: 8px;
	}

	.rank {
		left: 8px;
		top: 8px;
		background: var(--accent);
		border-color: transparent;
	}

	.meta {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.title {
		font-weight: 600;
		font-size: 0.95rem;
		line-height: 1.25;
	}

	.year {
		font-size: 0.8rem;
		color: var(--text-dim);
	}
</style>
