<script>
	/** @type {{ items: {label:string, href?:string}[] }} */
	let { items } = $props();
</script>

<nav aria-label="Brotkrümel" class="crumbs">
	{#each items as item, i}
		{#if i > 0}<span class="sep">/</span>{/if}
		{#if item.href}
			<a href={item.href}>{item.label}</a>
		{:else}
			<span aria-current="page">{item.label}</span>
		{/if}
	{/each}
</nav>

<style>
	.crumbs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		font-size: 0.85rem;
		color: var(--text-dim);
		margin-bottom: 1.25rem;
	}

	a:hover {
		color: #6cb6ff;
	}

	.sep {
		color: var(--text-faint);
	}

	[aria-current] {
		color: var(--text);
	}
</style>
