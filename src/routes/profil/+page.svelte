<script>
	import PageHeader from '#lib/components/PageHeader.svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import AvatarPicker from '#lib/components/AvatarPicker.svelte';

	let { data, form } = $props();
	const user = $derived(data.user);

	/** @type {Record<string, string>} */
	const errors = $derived(form && 'errors' in form && form.errors ? form.errors : {});
	let editing = $state(false);

	$effect.pre(() => {
		if (form && 'errors' in form) editing = true;
		if (form && 'saved' in form) editing = false;
	});
</script>

<svelte:head><title>Profil · Bragirium</title></svelte:head>

<PageHeader title="Profil" crumbs={[{ label: 'Startseite', href: '/' }, { label: 'Profil' }]} />

{#if user}
	{#if form && 'saved' in form}<p class="note ok" role="status">Profil gespeichert.</p>{/if}
	{#if form?.message}<p class="note warn" role="alert">{form.message}</p>{/if}

	<section class="card glass">
		{#if !editing}
			<div class="view">
				<Avatar url={user.avatar_url} name={user.name} size={96} />
				<div class="info">
					<h2>{user.name}</h2>
					<p class="muted">@{user.username}</p>
					<p class="since muted">
						Dabei seit {new Date(user.created_at).toLocaleDateString('de-CH', {
							month: 'long',
							year: 'numeric'
						})}
					</p>
				</div>
				<div class="actions">
					<button class="btn btn-ghost" onclick={() => (editing = true)}>Bearbeiten</button>
					<form method="POST" action="?/logout">
						<button class="btn btn-ghost">Abmelden</button>
					</form>
				</div>
			</div>
		{:else}
			<form method="POST" action="?/update" enctype="multipart/form-data" class="edit" novalidate>
				<AvatarPicker current={user.avatar_url} name={user.name} error={errors.avatar} />
				<label>
					<span>Name</span>
					<input name="name" value={form?.name ?? user.name} autocomplete="name" required />
					{#if errors.name}<small class="err">{errors.name}</small>{/if}
				</label>
				<label>
					<span>Username</span>
					<input value={user.username} disabled />
					<small class="hint">Der Username ist dein Login und kann nicht geändert werden.</small>
				</label>
				<div class="row">
					<button type="button" class="btn btn-ghost" onclick={() => (editing = false)}>Abbrechen</button>
					<button class="btn btn-primary">Speichern</button>
				</div>
			</form>
		{/if}
	</section>
{/if}

<style>
	.card {
		max-width: 680px;
		padding: 1.75rem;
	}

	.view {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.info {
		flex: 1;
		min-width: 180px;
	}

	h2 {
		font-size: 1.5rem;
	}

	.info p {
		margin: 0.2rem 0 0;
	}

	.since {
		font-size: 0.85rem;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.edit {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.85rem;
		color: var(--text-dim);
	}

	input {
		font: inherit;
		font-size: 1rem;
		color: var(--text);
		background: rgba(0, 0, 0, 0.25);
		border: 1px solid var(--glass-border);
		border-radius: var(--radius-sm);
		padding: 0.8rem 1rem;
		outline: none;
	}

	input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 4px var(--accent-soft);
	}

	input:disabled {
		opacity: 0.6;
	}

	.row {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.err {
		color: #ff6961;
	}

	.hint {
		color: var(--text-faint);
	}

	.note {
		max-width: 680px;
		padding: 0.75rem 1rem;
		border-radius: var(--radius-sm);
		font-size: 0.9rem;
	}

	.ok {
		background: rgba(48, 209, 88, 0.12);
		border: 1px solid rgba(48, 209, 88, 0.4);
		color: #8ee6a6;
	}

	.warn {
		background: rgba(255, 105, 97, 0.12);
		border: 1px solid rgba(255, 105, 97, 0.4);
		color: #ffb3ae;
	}
</style>
