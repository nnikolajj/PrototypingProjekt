<!--
	Cloudflare Turnstile Captcha. Das Widget schreibt sein Token in ein verstecktes
	Feld "cf-turnstile-response" im umgebenden Formular. Supabase prüft das Token
	serverseitig mit dem Secret Key (eingestellt im Supabase-Dashboard).
-->
<script>
	import { PUBLIC_TURNSTILE_SITE_KEY } from '$app/env/public';

	/** @type {HTMLDivElement | undefined} */
	let el = $state();

	// Explizit rendern, damit das Widget auch nach clientseitiger Navigation erscheint.
	$effect(() => {
		if (!el || !PUBLIC_TURNSTILE_SITE_KEY) return;
		/** @type {any} */
		const w = window;
		/** @type {string | undefined} */
		let widgetId;
		/** @type {ReturnType<typeof setTimeout>} */
		let timer;

		const tryRender = () => {
			if (w.turnstile) {
				widgetId = w.turnstile.render(el, {
					sitekey: PUBLIC_TURNSTILE_SITE_KEY,
					theme: 'dark',
					language: 'de'
				});
			} else {
				timer = setTimeout(tryRender, 100);
			}
		};
		tryRender();

		return () => {
			clearTimeout(timer);
			if (widgetId !== undefined) w.turnstile?.remove(widgetId);
		};
	});
</script>

<svelte:head>
	<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>
</svelte:head>

{#if PUBLIC_TURNSTILE_SITE_KEY}
	<div class="captcha" bind:this={el}></div>
{:else}
	<p class="warn">Captcha nicht konfiguriert (PUBLIC_TURNSTILE_SITE_KEY fehlt in .env).</p>
{/if}

<style>
	.captcha {
		min-height: 65px;
		display: flex;
		justify-content: center;
	}

	.warn {
		font-size: 0.8rem;
		color: #ffd60a;
		margin: 0;
	}
</style>
