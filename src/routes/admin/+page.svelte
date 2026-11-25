<script>
	import { enhance } from '$app/forms';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import Avatar from '#lib/components/Avatar.svelte';

	let { data, form } = $props();

	const roles = [
		{ value: 'user', label: 'User', desc: 'Kann stöbern, aber keine Filme schauen' },
		{ value: 'friend', label: 'Friend', desc: 'Darf Filme schauen' },
		{ value: 'admin', label: 'Admin', desc: 'Darf schauen und Rollen vergeben' }
	];

	let username = $state('');
	let role = $state('friend');
	let saving = $state(false);

	// Nach einem Fehler die Eingaben behalten
	$effect.pre(() => {
		if (form && 'username' in form && form.username) username = form.username;
		if (form && 'role' in form && form.role) role = form.role;
		if (form && 'success' in form) username = '';
	});

	/** @param {string} value */
	const label = (value) => roles.find((r) => r.value === value)?.label ?? value;

	/** @type {import('$app/forms').SubmitFunction} */
	const submit = () => {
		saving = true;
		return async ({ update }) => {
			await update({ reset: false });
			saving = false;
		};
	};
</script>

<svelte:head><title>Admin · Bragirium</title></svelte:head>

<PageHeader title="Rollen verwalten" crumbs={[{ label: 'Startseite', href: '/' }, { label: 'Admin' }]} />

{#if form && 'success' in form}
	<p class="note ok" role="status">✓ {form.success}</p>
{/if}
{#if form?.message}
	<p class="note warn" role="alert">{form.message}</p>
{/if}

<section class="card glass">
	<h2>Rolle vergeben</h2>
	<form method="POST" action="?/setRole" use:enhance={submit} class="assign">
		<label class="field">
			<span>Username</span>
			<div class="input-wrap">
				<span class="at">@</span>
				<input
					name="username"
					bind:value={username}
					list="usernames"
					placeholder="username"
					autocomplete="off"
					autocapitalize="none"
					spellcheck="false"
					required
				/>
			</div>
			<datalist id="usernames">
				{#each data.users.filter((u) => u.id !== data.me) as u (u.id)}
					<option value={u.username}>{u.name}</option>
				{/each}
			</datalist>
		</label>

		<fieldset class="field">
			<legend>Rolle</legend>
			<div class="segmented" role="radiogroup">
				{#each roles as r (r.value)}
					<label class:selected={role === r.value}>
						<input type="radio" name="role" value={r.value} bind:group={role} />
						{r.label}
					</label>
				{/each}
			</div>
			<small class="hint">{roles.find((r) => r.value === role)?.desc}</small>
		</fieldset>

		<button class="btn btn-primary" disabled={saving || !username.trim()}>
			{saving ? 'Speichert …' : 'Rolle speichern'}
		</button>
	</form>
</section>

<section class="card glass">
	<h2>Alle User <span class="count">{data.users.length}</span></h2>
	<ul class="users">
		{#each data.users as u (u.id)}
			<li>
				<Avatar url={u.avatar_url} name={u.name} size={40} />
				<div class="who">
					<strong>{u.name}{u.id === data.me ? ' (du)' : ''}</strong>
					<span class="muted">@{u.username}</span>
				</div>
				<span class="badge role-{u.role}">{label(u.role)}</span>
				{#if u.id !== data.me}
					<button
						type="button"
						class="btn btn-ghost small"
						onclick={() => {
							username = u.username;
							role = u.role;
							window.scrollTo({ top: 0, behavior: 'smooth' });
						}}>Ändern</button
					>
				{/if}
			</li>
		{/each}
	</ul>
</section>

<style>
	.card {
		max-width: 720px;
		padding: 1.5rem 1.75rem;
		margin-bottom: 1.5rem;
	}

	h2 {
		font-size: 1.15rem;
		margin: 0 0 1.1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.count {
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.15rem 0.55rem;
		border-radius: 999px;
		background: var(--glass-strong);
		color: var(--text-dim);
	}

	.assign {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		font-size: 0.85rem;
		color: var(--text-dim);
		border: 0;
		margin: 0;
		padding: 0;
	}

	legend {
		padding: 0;
		margin-bottom: 0.4rem;
	}

	.input-wrap {
		display: flex;
		align-items: center;
		background: rgba(0, 0, 0, 0.25);
		border: 1px solid var(--glass-border);
		border-radius: var(--radius-sm);
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}

	.input-wrap:focus-within {
		border-color: var(--accent);
		box-shadow: 0 0 0 4px var(--accent-soft);
	}

	.at {
		padding-left: 1rem;
		color: var(--text-faint);
		font-size: 1rem;
	}

	input:not([type='radio']) {
		flex: 1;
		font: inherit;
		font-size: 1rem;
		color: var(--text);
		background: none;
		border: 0;
		outline: none;
		padding: 0.8rem 1rem 0.8rem 0.25rem;
	}

	/* Segmented Control wie bei iOS */
	.segmented {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 3px;
		padding: 3px;
		border-radius: 12px;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid var(--glass-border);
	}

	.segmented label {
		position: relative;
		text-align: center;
		padding: 0.55rem;
		border-radius: 9px;
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--text-dim);
		cursor: pointer;
		transition:
			background 0.2s,
			color 0.2s;
	}

	.segmented label.selected {
		background: var(--glass-strong);
		color: var(--text);
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
	}

	.segmented label:has(input:focus-visible) {
		outline: 2px solid var(--accent);
	}

	.segmented input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.hint {
		color: var(--text-faint);
	}

	.assign .btn {
		align-self: flex-start;
	}

	.assign .btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.users {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	.users li {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding: 0.7rem 0;
	}

	.users li + li {
		border-top: 1px solid var(--glass-border);
	}

	.who {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		font-size: 0.92rem;
	}

	.who .muted {
		font-size: 0.8rem;
	}

	.badge {
		font-size: 0.72rem;
		font-weight: 600;
		padding: 0.25rem 0.65rem;
		border-radius: 999px;
		background: var(--glass-strong);
		color: var(--text-dim);
	}

	.role-friend {
		background: rgba(48, 209, 88, 0.15);
		color: #8ee6a6;
	}

	.role-admin {
		background: var(--accent-soft);
		color: #6cb6ff;
	}

	.small {
		padding: 0.35rem 0.8rem;
		font-size: 0.8rem;
	}

	.note {
		max-width: 720px;
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
