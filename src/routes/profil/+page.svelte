<script>
	import PageHeader from '#lib/components/PageHeader.svelte';

	let { data } = $props();
	const user = $derived(data.user);
</script>

<svelte:head><title>Profil · Bragirium</title></svelte:head>

<PageHeader title="Profil" crumbs={[{ label: 'Startseite', href: '/' }, { label: 'Profil' }]} />

{#if user}
	<div class="card glass">
		<div class="avatar">{user.name.slice(0, 1).toUpperCase()}</div>
		<div>
			<h2>{user.name}</h2>
			<p class="muted">{user.email}</p>
		</div>
		<form method="POST" action="?/logout">
			<button class="btn btn-ghost">Abmelden</button>
		</form>
	</div>
{/if}

<style>
	.card {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding: 1.75rem;
		max-width: 640px;
		margin-top: 1rem;
	}

	.avatar {
		width: 72px;
		height: 72px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		font-size: 1.8rem;
		font-weight: 700;
		background: linear-gradient(135deg, #5ac8fa, var(--accent));
		box-shadow: 0 8px 30px var(--accent-glow);
	}

	h2 {
		font-size: 1.4rem;
	}

	p {
		margin: 0.25rem 0 0;
	}

	form {
		margin-left: auto;
	}
</style>
