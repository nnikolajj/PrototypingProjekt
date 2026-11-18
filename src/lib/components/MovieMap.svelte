<!--
	Interaktive Film-Map im Stil von movie-map.com, aber mit TMDB-Daten:
	Der Film in der Mitte, ähnliche Filme drumherum. Je näher, desto ähnlicher.
	Klick auf einen Film → Map zentriert sich neu. Klick auf die Mitte → Infoseite.
-->
<script>
	import { goto } from '$app/navigation';
	import { img } from '#lib/tmdb-image.js';

	/**
	 * @typedef {{id:number,title:string,poster:string|null,year:string,ring:number,popularity:number}} MapMovie
	 * @typedef {{nodes: MapMovie[], links: {source:number,target:number}[]}} MapData
	 */

	/** @type {{ data: MapData }} */
	let { data: initial } = $props();

	/** @type {MapData | null} */
	let override = $state(null);
	let loading = $state(false);
	/** @type {number | null} */
	let hovered = $state(null);

	const current = $derived(override ?? initial);
	const layout = $derived(computeLayout(current));
	const centerNode = $derived(current.nodes.find((n) => n.ring === 0));

	const RADIUS = [46, 30, 22];
	const DIST = [0, 150, 105];

	/**
	 * Kleine Kraftsimulation (Abstoßung + Federn + Kollision), ohne Bibliothek.
	 * @param {MapData} d
	 */
	function computeLayout(d) {
		const pts = d.nodes.map((n, i) => {
			const a = (i / d.nodes.length) * Math.PI * 2;
			const r = n.ring * 140;
			return { ...n, x: Math.cos(a) * r, y: Math.sin(a) * r, vx: 0, vy: 0, r: RADIUS[n.ring] };
		});
		const byId = new Map(pts.map((p) => [p.id, p]));
		const links = d.links
			.map((l) => ({ s: byId.get(l.source), t: byId.get(l.target) }))
			.filter((l) => l.s && l.t);

		for (let step = 0; step < 300; step++) {
			const alpha = 1 - step / 300;
			for (let i = 0; i < pts.length; i++) {
				for (let j = i + 1; j < pts.length; j++) {
					const a = pts[i], b = pts[j];
					let dx = b.x - a.x, dy = b.y - a.y;
					let dist = Math.hypot(dx, dy) || 0.01;
					const min = a.r + b.r + 14;
					let f = (2200 / (dist * dist)) * alpha;
					if (dist < min) f += (min - dist) * 0.5;
					dx /= dist; dy /= dist;
					a.vx -= dx * f; a.vy -= dy * f;
					b.vx += dx * f; b.vy += dy * f;
				}
			}
			for (const { s, t } of links) {
				if (!s || !t) continue;
				const dx = t.x - s.x, dy = t.y - s.y;
				const dist = Math.hypot(dx, dy) || 0.01;
				const f = (dist - DIST[t.ring]) * 0.04 * alpha;
				s.vx += (dx / dist) * f; s.vy += (dy / dist) * f;
				t.vx -= (dx / dist) * f; t.vy -= (dy / dist) * f;
			}
			for (const p of pts) {
				if (p.ring === 0) { p.x = 0; p.y = 0; p.vx = p.vy = 0; continue; }
				p.vx -= p.x * 0.004; p.vy -= p.y * 0.004;
				p.x += p.vx *= 0.6;
				p.y += p.vy *= 0.6;
			}
		}

		const pad = 70;
		const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
		const minX = Math.min(...xs) - pad, maxX = Math.max(...xs) + pad;
		const minY = Math.min(...ys) - pad, maxY = Math.max(...ys) + pad;
		return {
			nodes: pts,
			links: links.map(({ s, t }) => ({ x1: s?.x, y1: s?.y, x2: t?.x, y2: t?.y, sid: s?.id, tid: t?.id })),
			viewBox: `${minX} ${minY} ${maxX - minX} ${maxY - minY}`
		};
	}

	/** @param {MapMovie} node */
	async function select(node) {
		if (node.ring === 0) return goto(`/film/${node.id}`);
		loading = true;
		try {
			const res = await fetch(`/api/map/${node.id}`);
			if (res.ok) override = await res.json();
		} finally {
			loading = false;
		}
	}

	/** Wenn sich die Startdaten ändern (z.B. andere Auswahl), lokale Navigation zurücksetzen. */
	$effect(() => {
		initial;
		override = null;
	});
</script>

<div class="map glass" class:loading>
	<svg viewBox={layout.viewBox} role="img" aria-label="Film-Map rund um {centerNode?.title}">
		<defs>
			<radialGradient id="center-glow">
				<stop offset="0" stop-color="#0a84ff" stop-opacity="0.55" />
				<stop offset="1" stop-color="#0a84ff" stop-opacity="0" />
			</radialGradient>
			{#each layout.nodes as n (n.id)}
				<clipPath id="clip-{n.id}"><circle cx={n.x} cy={n.y} r={n.r} /></clipPath>
			{/each}
		</defs>

		<circle cx="0" cy="0" r="130" fill="url(#center-glow)" />

		{#each layout.links as l}
			<line
				x1={l.x1}
				y1={l.y1}
				x2={l.x2}
				y2={l.y2}
				class:hot={hovered === l.sid || hovered === l.tid}
			/>
		{/each}

		{#each layout.nodes as n (n.id)}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<g
				class="node ring-{n.ring}"
				class:dim={hovered !== null && hovered !== n.id}
				onmouseenter={() => (hovered = n.id)}
				onmouseleave={() => (hovered = null)}
				onclick={() => select(n)}
				onkeydown={(e) => e.key === 'Enter' && select(n)}
				tabindex="0"
				role="button"
				aria-label={n.ring === 0 ? `${n.title} – Infoseite öffnen` : `${n.title} – Map zentrieren`}
			>
				<circle cx={n.x} cy={n.y} r={n.r + 3} class="ring" />
				{#if n.poster}
					<image
						href={img(n.poster, n.ring === 0 ? 'w185' : 'w92')}
						x={n.x - n.r}
						y={n.y - n.r * 1.5}
						width={n.r * 2}
						height={n.r * 3}
						preserveAspectRatio="xMidYMid slice"
						clip-path="url(#clip-{n.id})"
					/>
				{/if}
				<text x={n.x} y={n.y + n.r + 16} text-anchor="middle">
					{n.title.length > 22 ? n.title.slice(0, 21) + '…' : n.title}
				</text>
			</g>
		{/each}
	</svg>

	<div class="hint">
		{#if override}
			<button class="btn btn-ghost small" onclick={() => (override = null)}>↺ Zurück</button>
		{/if}
		<span>Klick auf einen Film zentriert die Map · Klick auf die Mitte öffnet die Infoseite</span>
	</div>
</div>

<style>
	.map {
		position: relative;
		overflow: hidden;
		padding: 0.5rem;
	}

	svg {
		width: 100%;
		height: clamp(380px, 60vw, 600px);
		display: block;
	}

	.loading svg {
		opacity: 0.4;
		transition: opacity 0.2s;
	}

	line {
		stroke: rgba(255, 255, 255, 0.12);
		stroke-width: 1.2;
		transition: stroke 0.2s;
	}

	line.hot {
		stroke: var(--accent);
		stroke-width: 2;
	}

	.node {
		cursor: pointer;
		transition: opacity 0.2s;
		outline: none;
	}

	.node.dim {
		opacity: 0.35;
	}

	.ring {
		fill: var(--bg-elev);
		stroke: rgba(255, 255, 255, 0.25);
		stroke-width: 1.5;
		transition: stroke 0.2s;
	}

	.ring-0 .ring {
		stroke: var(--accent);
		stroke-width: 3;
	}

	.node:hover .ring,
	.node:focus-visible .ring {
		stroke: #5ac8fa;
		stroke-width: 3;
	}

	text {
		fill: var(--text);
		font-size: 11px;
		font-weight: 500;
		paint-order: stroke;
		stroke: rgba(13, 16, 23, 0.85);
		stroke-width: 3px;
		pointer-events: none;
	}

	.ring-0 text {
		font-size: 14px;
		font-weight: 700;
	}

	.ring-2 text {
		font-size: 9.5px;
		fill: var(--text-dim);
	}

	.hint {
		position: absolute;
		left: 1rem;
		bottom: 0.9rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.78rem;
		color: var(--text-dim);
	}

	.small {
		padding: 0.35rem 0.8rem;
		font-size: 0.8rem;
	}
</style>
