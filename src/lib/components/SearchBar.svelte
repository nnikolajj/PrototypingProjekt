<script>
	let { value = '', autofocus = false } = $props();
</script>

<form action="/suche" method="GET" class="search glass" role="search">
	<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
		<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
		<path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
	</svg>
	<!-- svelte-ignore a11y_autofocus -->
	<input
		type="search"
		name="q"
		{value}
		{autofocus}
		placeholder="Filme suchen …"
		aria-label="Filme suchen"
		autocomplete="off"
	/>
	<button type="submit" class="btn btn-primary">Suchen</button>
</form>

<style>
	.search {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.4rem 0.4rem 0.4rem 1.2rem;
		border-radius: 999px;
		color: var(--text-dim);
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}

	.search:focus-within {
		border-color: rgba(10, 132, 255, 0.6);
		box-shadow:
			0 0 0 4px var(--accent-soft),
			0 10px 40px rgba(0, 0, 0, 0.35);
	}

	input {
		flex: 1;
		min-width: 0;
		background: none;
		border: none;
		outline: none;
		color: var(--text);
		font: inherit;
		font-size: 1.05rem;
		padding: 0.6rem 0;
	}

	input::placeholder {
		color: var(--text-faint);
	}

	.btn {
		padding: 0.65rem 1.3rem;
	}
</style>
