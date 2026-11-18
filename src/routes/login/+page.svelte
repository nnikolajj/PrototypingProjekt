<script>
	import Logo from '#lib/components/Logo.svelte';

	let { form } = $props();
</script>

<svelte:head><title>Registrierung / Login · Bragirium</title></svelte:head>

<div class="wrap">
	<form method="POST" class="card glass" novalidate>
		<div class="logo"><Logo size={52} /></div>
		<h1>Registrierung / Login</h1>
		<p class="muted sub">Melde dich an, um Filme anzuschauen.</p>

		<label>
			<span>Name</span>
			<input name="name" autocomplete="name" value={form?.name ?? ''} required />
			{#if form?.errors?.name}<small class="err">{form.errors.name}</small>{/if}
		</label>

		<label>
			<span>E-Mail</span>
			<input name="email" type="email" autocomplete="email" value={form?.email ?? ''} required />
			{#if form?.errors?.email}<small class="err">{form.errors.email}</small>{/if}
		</label>

		<label>
			<span>Passwort</span>
			<input name="password" type="password" autocomplete="current-password" required />
			{#if form?.errors?.password}<small class="err">{form.errors.password}</small>{/if}
		</label>

		<label class="captcha">
			<input type="checkbox" name="human" />
			<span>Ich bin kein Roboter</span>
			<span class="badge muted">Captcha</span>
		</label>
		{#if form?.errors?.human}<small class="err">{form.errors.human}</small>{/if}

		<button class="btn btn-primary submit">Anmelden</button>
		<p class="note muted">Prototyp: Es wird kein Passwort gespeichert.</p>
	</form>
</div>

<style>
	.wrap {
		display: grid;
		place-items: center;
		padding-block: 2rem;
	}

	.card {
		width: min(420px, 100%);
		padding: 2.25rem 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.logo {
		display: flex;
		justify-content: center;
	}

	h1 {
		text-align: center;
		font-size: 1.6rem;
	}

	.sub {
		text-align: center;
		margin: -0.5rem 0 0.5rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.85rem;
		color: var(--text-dim);
	}

	input:not([type='checkbox']) {
		font: inherit;
		font-size: 1rem;
		color: var(--text);
		background: rgba(0, 0, 0, 0.25);
		border: 1px solid var(--glass-border);
		border-radius: var(--radius-sm);
		padding: 0.8rem 1rem;
		outline: none;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	input:not([type='checkbox']):focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 4px var(--accent-soft);
	}

	.captcha {
		flex-direction: row;
		align-items: center;
		gap: 0.75rem;
		padding: 0.9rem 1rem;
		border: 1px solid var(--glass-border);
		border-radius: var(--radius-sm);
		background: rgba(0, 0, 0, 0.2);
		color: var(--text);
		font-size: 0.95rem;
		cursor: pointer;
	}

	.captcha input {
		width: 22px;
		height: 22px;
		accent-color: var(--accent);
	}

	.badge {
		margin-left: auto;
		font-size: 0.7rem;
	}

	.err {
		color: #ff6961;
	}

	.submit {
		margin-top: 0.5rem;
		padding-block: 0.95rem;
	}

	.note {
		font-size: 0.75rem;
		text-align: center;
		margin: 0;
	}
</style>
