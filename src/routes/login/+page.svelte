<script>
	import Logo from '#lib/components/Logo.svelte';
	import Turnstile from '#lib/components/Turnstile.svelte';

	let { form } = $props();

	/** @type {'login' | 'register'} */
	let mode = $state('login');
	// Nach einem fehlgeschlagenen Absenden im passenden Tab bleiben.
	$effect.pre(() => {
		if (form?.mode === 'login' || form?.mode === 'register') mode = form.mode;
	});

	/** @type {Record<string, string>} */
	const errors = $derived(form && 'errors' in form && form.errors ? form.errors : {});
</script>

<svelte:head><title>Registrierung / Login · Bragirium</title></svelte:head>

<div class="wrap">
	<div class="card glass">
		<div class="logo"><Logo size={52} /></div>
		<h1>{mode === 'login' ? 'Willkommen zurück' : 'Konto erstellen'}</h1>

		<div class="tabs" role="tablist">
			<button
				type="button"
				role="tab"
				aria-selected={mode === 'login'}
				class:active={mode === 'login'}
				onclick={() => (mode = 'login')}>Anmelden</button
			>
			<button
				type="button"
				role="tab"
				aria-selected={mode === 'register'}
				class:active={mode === 'register'}
				onclick={() => (mode = 'register')}>Registrieren</button
			>
		</div>

		{#if form?.message}<p class="alert" role="alert">{form.message}</p>{/if}

		{#key mode}
			{#if mode === 'login'}
				<form method="POST" action="?/login" novalidate>
					<label>
						<span>Username</span>
						<input
							name="username"
							autocomplete="username"
							autocapitalize="none"
							value={form?.username ?? ''}
							required
						/>
					</label>
					<label>
						<span>Passwort</span>
						<input name="password" type="password" autocomplete="current-password" required />
					</label>
					<Turnstile />
					<button class="btn btn-primary submit">Anmelden</button>
				</form>
			{:else}
				<form method="POST" action="?/register" novalidate>
					<label>
						<span>Name</span>
						<input name="name" autocomplete="name" value={form?.name ?? ''} required />
						{#if errors.name}<small class="err">{errors.name}</small>{/if}
					</label>
					<label>
						<span>Username</span>
						<input
							name="username"
							autocomplete="username"
							autocapitalize="none"
							value={form?.username ?? ''}
							required
						/>
						{#if errors.username}
							<small class="err">{errors.username}</small>
						{:else}
							<small class="hint">3–20 Zeichen: Kleinbuchstaben, Zahlen und _</small>
						{/if}
					</label>
					<label>
						<span>Passwort</span>
						<input name="password" type="password" autocomplete="new-password" required />
						{#if errors.password}<small class="err">{errors.password}</small>{/if}
					</label>
					<label>
						<span>Passwort wiederholen</span>
						<input name="password2" type="password" autocomplete="new-password" required />
						{#if errors.password2}<small class="err">{errors.password2}</small>{/if}
					</label>
					<Turnstile />
					<button class="btn btn-primary submit">Registrieren</button>
				</form>
			{/if}
		{/key}
	</div>
</div>

<style>
	.wrap {
		display: grid;
		place-items: center;
		padding-block: 1rem;
	}

	.card {
		width: min(440px, 100%);
		padding: 2.25rem 2rem;
	}

	.logo {
		display: flex;
		justify-content: center;
		margin-bottom: 0.75rem;
	}

	h1 {
		text-align: center;
		font-size: 1.6rem;
	}

	.tabs {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4px;
		padding: 4px;
		margin: 1.5rem 0;
		border-radius: 999px;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid var(--glass-border);
	}

	.tabs button {
		font: inherit;
		font-size: 0.9rem;
		font-weight: 600;
		padding: 0.55rem;
		border: 0;
		border-radius: 999px;
		background: transparent;
		color: var(--text-dim);
		cursor: pointer;
		transition: background 0.2s, color 0.2s;
	}

	.tabs button.active {
		background: var(--glass-strong);
		color: var(--text);
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
	}

	form {
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
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 4px var(--accent-soft);
	}

	.err {
		color: #ff6961;
	}

	.hint {
		color: var(--text-faint);
	}

	.alert {
		margin: 0 0 1rem;
		padding: 0.75rem 1rem;
		border-radius: var(--radius-sm);
		background: rgba(255, 105, 97, 0.12);
		border: 1px solid rgba(255, 105, 97, 0.4);
		color: #ffb3ae;
		font-size: 0.9rem;
	}

	.submit {
		margin-top: 0.25rem;
		padding-block: 0.95rem;
	}
</style>
