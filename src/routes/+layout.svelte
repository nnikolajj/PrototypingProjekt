<script lang="ts">
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import Logo from '#lib/components/Logo.svelte';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	const initials = $derived(
		data.user?.name
			.split(/\s+/)
			.map((p) => p[0])
			.join('')
			.slice(0, 2)
			.toUpperCase() ?? ''
	);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Bragirium</title>
</svelte:head>

<header class="topbar">
	<div class="container bar">
		<a href="/" class="brand" aria-label="Bragirium Startseite">
			<Logo />
			<span>Bragirium</span>
		</a>

		<a
			href={data.user ? '/profil' : '/login'}
			class="profile glass"
			title={data.user ? `Profil von ${data.user.name}` : 'Anmelden'}
		>
			{#if data.user}
				<span class="avatar">{initials}</span>
				<span class="profile-label">{data.user.name}</span>
			{:else}
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8" />
					<path
						d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
					/>
				</svg>
				<span class="profile-label">Anmelden</span>
			{/if}
		</a>
	</div>
</header>

<main class="container">
	{@render children()}
</main>

<footer class="container footer">
	<span>Filmdaten von</span>
	<a href="https://www.themoviedb.org" target="_blank" rel="noreferrer">TMDB</a>
	<span class="muted">· Dieses Produkt nutzt die TMDB-API, ist aber nicht von TMDB unterstützt oder zertifiziert.</span>
</footer>

<style>
	.topbar {
		position: sticky;
		top: 0;
		z-index: 50;
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		background: rgba(13, 16, 23, 0.6);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	}

	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 64px;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 1.35rem;
		font-weight: 700;
		letter-spacing: -0.03em;
	}

	.profile {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.35rem 0.9rem 0.35rem 0.4rem;
		border-radius: 999px;
		font-size: 0.9rem;
		font-weight: 500;
		transition: background 0.2s;
		box-shadow: none;
	}

	.profile:hover {
		background: var(--glass-strong);
	}

	.profile svg {
		margin-left: 0.4rem;
	}

	.avatar {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		font-size: 0.75rem;
		font-weight: 700;
		background: linear-gradient(135deg, #5ac8fa, var(--accent));
	}

	main {
		padding-block: 2rem 4rem;
	}

	.footer {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		font-size: 0.8rem;
		padding-bottom: 2rem;
		color: var(--text-dim);
	}

	.footer a {
		color: #6cb6ff;
	}

	@media (max-width: 560px) {
		.profile-label {
			display: none;
		}
		.profile {
			padding: 0.35rem;
		}
	}
</style>
