<script>
	import { page } from '$app/state';
</script>

<div class="err glass">
	<h1>{page.status}</h1>
	<p>{page.error?.message}</p>
	<a href="/" class="btn btn-primary">Zur Startseite</a>
</div>

<style>
	.err {
		max-width: 560px;
		margin: 4rem auto;
		padding: 2.5rem;
		text-align: center;
	}

	h1 {
		font-size: 3rem;
		color: var(--accent);
	}

	p {
		color: var(--text-dim);
		margin: 0.75rem 0 1.75rem;
	}
</style>
