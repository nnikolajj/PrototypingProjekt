<script>
	/** @type {{ url?: string | null, name?: string, size?: number }} */
	let { url = null, name = '', size = 32 } = $props();

	const initials = $derived(
		name
			.split(/\s+/)
			.filter(Boolean)
			.map((p) => p[0])
			.join('')
			.slice(0, 2)
			.toUpperCase() || '?'
	);
</script>

<span class="avatar" style="--size: {size}px">
	{#if url}
		<img src={url} alt="Profilbild von {name}" />
	{:else}
		{initials}
	{/if}
</span>

<style>
	.avatar {
		width: var(--size);
		height: var(--size);
		flex-shrink: 0;
		border-radius: 50%;
		overflow: hidden;
		display: grid;
		place-items: center;
		font-size: calc(var(--size) * 0.38);
		font-weight: 700;
		color: white;
		background: linear-gradient(135deg, #5ac8fa, var(--accent));
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
