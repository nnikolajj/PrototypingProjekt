<script>
	import Breadcrumb from './Breadcrumb.svelte';

	/** @type {{ title: string, subtitle?: string, crumbs: {label:string, href?:string}[] }} */
	let { title, subtitle, crumbs } = $props();
</script>

<Breadcrumb items={crumbs} />
<h1>{title}</h1>
{#if subtitle}<p class="muted">{subtitle}</p>{/if}

<style>
	h1 {
		font-size: clamp(2rem, 4vw, 2.8rem);
		font-weight: 700;
	}

	p {
		margin: 0.5rem 0 2rem;
	}
</style>
