<!--
	Interaktive Film-Map: Der Film in der Mitte, ähnliche Filme in Ringen drumherum.
	Ring 1 = direkte Empfehlungen, Ring 2 und 3 = Empfehlungen der Empfehlungen.
	Bedienung wie eine Karte: ziehen zum Verschieben, Zoom mit +/−, Doppelklick,
	Pinch oder Strg/⌘ + Scrollrad. Titel erscheinen nur, wo sie Platz haben –
	je weiter man hineinzoomt, desto mehr.
-->
<script>
	import { goto } from '$app/navigation';
	import { img } from '#lib/tmdb-image.js';
	import MapSearch from '#lib/components/MapSearch.svelte';

	/**
	 * @typedef {{id:number,title:string,poster:string|null,year:string,ring:number,parent:number|null,popularity:number}} MapMovie
	 * @typedef {{nodes: MapMovie[], links: {source:number,target:number}[]}} MapData
	 * @typedef {MapMovie & {x:number,y:number,r:number}} Placed
	 */

	/** @type {{ data: MapData, searchable?: boolean }} */
	let { data: initial, searchable = false } = $props();

	/** @type {MapData | null} */
	let override = $state(null);
	let loading = $state(false);
	/** @type {number | null} */
	let hovered = $state(null);

	const current = $derived(override ?? initial);
	const layout = $derived(computeLayout(current));
	const centerNode = $derived(current.nodes.find((n) => n.ring === 0));

	// ── Geometrie ────────────────────────────────────────────────
	/** Abstand der Ringe zur Mitte (Weltkoordinaten) */
	const RING_DIST = [0, 220, 350, 450];
	/** Radius der Kreise pro Ring */
	const NODE_R = [66, 44, 32, 25];
	/** Schriftgrösse der Titel in Bildschirm-Pixeln (bleibt beim Zoomen gleich) */
	const FONT = [16, 12.5, 11.5, 11];
	const MIN_K = 0.2;
	const MAX_K = 2.5;

	/**
	 * Radiales Layout: jeder Ring hat seinen Abstand, Kinder starten beim Winkel
	 * ihres "Eltern"-Films (so entstehen Äste), danach schiebt eine kleine
	 * Simulation überlappende Kreise auseinander.
	 * @param {MapData} d
	 */
	function computeLayout(d) {
		/** @type {Map<number, Placed>} */
		const byId = new Map();
		/** @type {Map<number, number>} */
		const angle = new Map();

		for (let ring = 0; ring <= 3; ring++) {
			const inRing = d.nodes.filter((n) => n.ring === ring);
			// Geschwister nebeneinander, damit Äste zusammenhängend bleiben
			/** @type {Map<number, MapMovie[]>} */
			const groups = new Map();
			for (const n of inRing) {
				const key = n.parent ?? 0;
				groups.set(key, [...(groups.get(key) ?? []), n]);
			}
			const slot = (Math.PI * 2) / Math.max(inRing.length, 1);
			let i = 0;
			for (const [parent, kids] of groups) {
				const base = ring === 1 ? null : (angle.get(parent) ?? 0);
				kids.forEach((n, j) => {
					const a = base === null ? i * slot : base + (j - (kids.length - 1) / 2) * slot;
					angle.set(n.id, a);
					byId.set(n.id, {
						...n,
						x: Math.cos(a) * RING_DIST[ring],
						y: Math.sin(a) * RING_DIST[ring],
						r: NODE_R[ring]
					});
					i++;
				});
			}
		}

		const pts = [...byId.values()];
		const STEPS = 260;
		for (let step = 0; step < STEPS; step++) {
			const alpha = 1 - step / STEPS;
			// Kollision: Kreise inkl. Platz für Titel nie überlappen lassen
			for (let i = 0; i < pts.length; i++) {
				for (let j = i + 1; j < pts.length; j++) {
					const a = pts[i];
					const b = pts[j];
					let dx = b.x - a.x;
					let dy = b.y - a.y;
					const dist = Math.hypot(dx, dy) || 0.01;
					const min = a.r + b.r + 48;
					if (dist >= min * 1.6) continue;
					dx /= dist;
					dy /= dist;
					const push = dist < min ? (min - dist) * 0.5 : ((min * 1.6 - dist) / min) * 4 * alpha;
					const wa = a.ring === 0 ? 0 : b.ring === 0 ? 1 : 0.5;
					a.x -= dx * push * wa;
					a.y -= dy * push * wa;
					b.x += dx * push * (1 - wa);
					b.y += dy * push * (1 - wa);
				}
			}
			// Jeden Film zurück auf "seinen" Ring ziehen
			for (const p of pts) {
				if (p.ring === 0) {
					p.x = p.y = 0;
					continue;
				}
				const dist = Math.hypot(p.x, p.y) || 0.01;
				const f = ((RING_DIST[p.ring] - dist) / dist) * 0.15;
				p.x += p.x * f;
				p.y += p.y * f;
			}
		}

		const links = d.links
			.map((l) => ({ s: byId.get(l.source), t: byId.get(l.target) }))
			.filter((l) => l.s && l.t)
			.map(({ s, t }) => ({
				x1: /** @type {Placed} */ (s).x,
				y1: /** @type {Placed} */ (s).y,
				x2: /** @type {Placed} */ (t).x,
				y2: /** @type {Placed} */ (t).y,
				sid: /** @type {Placed} */ (s).id,
				tid: /** @type {Placed} */ (t).id,
				main: /** @type {Placed} */ (t).parent === /** @type {Placed} */ (s).id
			}));

		// Zeichenreihenfolge: äussere Ringe zuerst, die Mitte zuletzt (oben)
		return { nodes: pts.sort((a, b) => b.ring - a.ring), links };
	}

	// ── Kamera (Verschieben / Zoomen) ────────────────────────────
	let w = $state(0);
	let h = $state(0);
	/** @type {SVGSVGElement | undefined} */
	let svgEl = $state();

	/** Solange niemand gezogen/gezoomt hat, passt sich die Ansicht automatisch an. */
	let userMoved = $state(false);
	let cam = $state({ tx: 0, ty: 0, k: 1 });

	/** Startzoom: Mitte + erster Ring passen genau hinein */
	const fitK = $derived(
		w && h ? clampK(Math.min(w, h) / (2 * (RING_DIST[1] + NODE_R[1] + 60))) : 0.6
	);
	const view = $derived(userMoved ? cam : { tx: 0, ty: 0, k: fitK });

	/** @param {number} k */
	function clampK(k) {
		return Math.min(MAX_K, Math.max(MIN_K, k));
	}

	function takeControl() {
		if (!userMoved) {
			cam = { ...view };
			userMoved = true;
		}
	}

	/**
	 * Zoomt um einen Bildschirmpunkt (der Punkt unter dem Cursor bleibt stehen).
	 * @param {number} factor @param {number} [sx] @param {number} [sy]
	 */
	function zoomAt(factor, sx = w / 2, sy = h / 2) {
		takeControl();
		const k = clampK(cam.k * factor);
		const wx = (sx - w / 2 - cam.tx) / cam.k;
		const wy = (sy - h / 2 - cam.ty) / cam.k;
		cam = { k, tx: sx - w / 2 - wx * k, ty: sy - h / 2 - wy * k };
	}

	function resetView() {
		userMoved = false;
	}

	/** Weiche Kamerafahrt für Knöpfe und Suche (nicht beim Ziehen – da soll es direkt folgen). */
	let flying = $state(false);
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let flyTimer;
	/** @param {() => void} fn */
	function fly(fn) {
		flying = true;
		fn();
		clearTimeout(flyTimer);
		flyTimer = setTimeout(() => (flying = false), 650);
	}

	/** @param {{clientX:number, clientY:number}} e */
	function local(e) {
		const rect = /** @type {SVGSVGElement} */ (svgEl).getBoundingClientRect();
		return { x: e.clientX - rect.left, y: e.clientY - rect.top };
	}

	/** Aktive Finger/Maus (nicht reaktiv, nur für die Gesten-Berechnung) */
	const pointers = new Map();
	/** @type {{x:number,y:number,tx:number,ty:number} | null} */
	let panStart = null;
	/** @type {{dist:number,k:number,wx:number,wy:number} | null} */
	let pinchStart = null;
	let moved = 0;
	let suppressClick = false;
	let dragging = $state(false);

	function startGesture() {
		const pts = [...pointers.values()];
		if (pts.length === 1) {
			panStart = { x: pts[0].x, y: pts[0].y, tx: cam.tx, ty: cam.ty };
			pinchStart = null;
		} else if (pts.length >= 2) {
			const [a, b] = pts;
			const mid = local({ clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 });
			pinchStart = {
				dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
				k: cam.k,
				wx: (mid.x - w / 2 - cam.tx) / cam.k,
				wy: (mid.y - h / 2 - cam.ty) / cam.k
			};
			panStart = null;
		}
	}

	/** @param {PointerEvent} e */
	function onPointerDown(e) {
		if (e.pointerType === 'mouse' && e.button !== 0) return;
		takeControl();
		pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
		if (pointers.size === 1) moved = 0;
		dragging = true;
		startGesture();
	}

	/** @param {PointerEvent} e */
	function onPointerMove(e) {
		if (!pointers.has(e.pointerId)) return;
		pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
		if (panStart && pointers.size === 1) {
			const dx = e.clientX - panStart.x;
			const dy = e.clientY - panStart.y;
			moved = Math.max(moved, Math.hypot(dx, dy));
			cam = { ...cam, tx: panStart.tx + dx, ty: panStart.ty + dy };
		} else if (pinchStart && pointers.size >= 2) {
			const [a, b] = [...pointers.values()];
			const mid = local({ clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 });
			const k = clampK((pinchStart.k * Math.hypot(a.x - b.x, a.y - b.y)) / pinchStart.dist);
			moved = Infinity;
			cam = { k, tx: mid.x - w / 2 - pinchStart.wx * k, ty: mid.y - h / 2 - pinchStart.wy * k };
		}
	}

	/** @param {PointerEvent} e */
	function onPointerUp(e) {
		if (!pointers.delete(e.pointerId)) return;
		if (pointers.size === 0) {
			dragging = false;
			// Nach dem Ziehen keinen "Klick" auf einen Film auslösen
			suppressClick = moved > 6;
			setTimeout(() => (suppressClick = false), 0);
		} else {
			startGesture();
		}
	}

	let showWheelHint = $state(false);
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let wheelTimer;

	// Wheel braucht einen nicht-passiven Listener, sonst lässt sich das Seiten-Scrollen nicht verhindern.
	$effect(() => {
		const el = svgEl;
		if (!el) return;
		/** @param {WheelEvent} e */
		const onWheel = (e) => {
			if (e.ctrlKey || e.metaKey) {
				// Strg/⌘ + Rad oder Trackpad-Pinch → zoomen
				e.preventDefault();
				const p = local(e);
				const delta = Math.max(-50, Math.min(50, e.deltaY));
				zoomAt(Math.exp(-delta * 0.01), p.x, p.y);
			} else {
				// Normales Scrollen scrollt weiter die Seite – nur kurz Hinweis zeigen
				showWheelHint = true;
				clearTimeout(wheelTimer);
				wheelTimer = setTimeout(() => (showWheelHint = false), 1400);
			}
		};
		el.addEventListener('wheel', onWheel, { passive: false });
		return () => el.removeEventListener('wheel', onWheel);
	});

	/** @param {MouseEvent} e */
	function onDblClick(e) {
		if ((/** @type {Element} */ (e.target)).closest('.node')) return;
		const p = local(e);
		zoomAt(e.shiftKey ? 1 / 1.8 : 1.8, p.x, p.y);
	}

	// ── Titel ohne Überlappung ───────────────────────────────────
	/**
	 * Welche Titel passen bei der aktuellen Zoomstufe hin, ohne sich oder
	 * fremde Poster zu überdecken? Wichtigere (innere Ringe, bekanntere Filme) zuerst.
	 */
	const visibleLabels = $derived.by(() => {
		const k = view.k;
		/** @type {{x1:number,y1:number,x2:number,y2:number}[]} */
		const boxes = [];
		/** @type {Set<number>} */
		const shown = new Set();
		const order = [...layout.nodes].sort((a, b) => a.ring - b.ring || b.popularity - a.popularity);

		for (const n of order) {
			const fs = FONT[n.ring];
			const text = label(n.title);
			const bw = text.length * fs * 0.56 + 6;
			const top = (n.y + n.r) * k + 4;
			const box = { x1: n.x * k - bw / 2, y1: top, x2: n.x * k + bw / 2, y2: top + fs * 1.3 };

			const hitsLabel = boxes.some(
				(b) => box.x1 < b.x2 && box.x2 > b.x1 && box.y1 < b.y2 && box.y2 > b.y1
			);
			const hitsPoster = layout.nodes.some((m) => {
				if (m.id === n.id) return false;
				const cx = Math.max(box.x1, Math.min(m.x * k, box.x2));
				const cy = Math.max(box.y1, Math.min(m.y * k, box.y2));
				return Math.hypot(cx - m.x * k, cy - m.y * k) < m.r * k;
			});
			if (n.ring === 0 || (!hitsLabel && !hitsPoster)) {
				boxes.push(box);
				shown.add(n.id);
			}
		}
		return shown;
	});

	/** @param {string} title */
	function label(title) {
		return title.length > 24 ? title.slice(0, 23) + '…' : title;
	}

	// ── Navigation in der Map ────────────────────────────────────
	/** @param {MapMovie} node */
	async function select(node) {
		if (suppressClick) return;
		if (node.ring === 0) return goto(`/film/${node.id}`);
		await loadMap(node.id);
	}

	/** Baut die Map neu um einen Film auf. @param {number} id */
	async function loadMap(id) {
		loading = true;
		try {
			const res = await fetch(`/api/map/${id}`);
			if (res.ok) {
				override = await res.json();
				resetView();
			}
		} finally {
			loading = false;
		}
	}

	/** @type {number | null} */
	let focused = $state(null);
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let focusTimer;

	/**
	 * Fliegt zu einem Film, der schon auf der Map ist, und lässt ihn kurz leuchten.
	 * @param {number} id
	 */
	function focusNode(id) {
		const n = layout.nodes.find((m) => m.id === id);
		if (!n) return;
		takeControl();
		const k = Math.max(cam.k, 1.1);
		cam = { k, tx: -n.x * k, ty: -n.y * k };
		focused = id;
		clearTimeout(focusTimer);
		focusTimer = setTimeout(() => (focused = null), 2600);
	}

	/** @param {{ id: number, onMap: boolean }} pick */
	function onSearchPick(pick) {
		if (pick.onMap) fly(() => focusNode(pick.id));
		else loadMap(pick.id);
	}

	/** Wenn sich die Startdaten ändern (z.B. andere Auswahl), lokale Navigation zurücksetzen. */
	$effect(() => {
		initial;
		override = null;
		resetView();
	});

	const hoveredNode = $derived(layout.nodes.find((n) => n.id === hovered));
</script>

<svelte:window onpointermove={onPointerMove} onpointerup={onPointerUp} onpointercancel={onPointerUp} />

<div class="map glass" class:loading bind:clientWidth={w} bind:clientHeight={h}>
	<svg
		bind:this={svgEl}
		width={w}
		height={h}
		class:dragging
		role="application"
		aria-label="Film-Map rund um {centerNode?.title}. Ziehen zum Verschieben, Plus und Minus zum Zoomen."
		onpointerdown={onPointerDown}
		ondblclick={onDblClick}
	>
		<defs>
			<radialGradient id="center-glow">
				<stop offset="0" stop-color="#0a84ff" stop-opacity="0.45" />
				<stop offset="1" stop-color="#0a84ff" stop-opacity="0" />
			</radialGradient>
			{#each layout.nodes as n (n.id)}
				<clipPath id="clip-{n.id}"><circle cx={n.x} cy={n.y} r={n.r} /></clipPath>
			{/each}
		</defs>

		<g
			class="camera"
			class:flying
			style:transform="translate({w / 2 + view.tx}px, {h / 2 + view.ty}px) scale({view.k})"
		>
			<!-- Ringe als feine Orientierung, wie Höhenlinien -->
			{#each RING_DIST.slice(1) as r}
				<circle cx="0" cy="0" {r} class="orbit" vector-effect="non-scaling-stroke" />
			{/each}
			<circle cx="0" cy="0" r="260" fill="url(#center-glow)" />

			{#each layout.links as l}
				<line
					x1={l.x1}
					y1={l.y1}
					x2={l.x2}
					y2={l.y2}
					class:cross={!l.main}
					class:hot={hovered === l.sid || hovered === l.tid}
					vector-effect="non-scaling-stroke"
				/>
			{/each}

			{#each layout.nodes as n (n.id)}
				<g
					class="node ring-{n.ring}"
					class:focused={focused === n.id}
					class:dim={(hovered !== null && hovered !== n.id) || (focused !== null && focused !== n.id)}
					onmouseenter={() => (hovered = n.id)}
					onmouseleave={() => (hovered = null)}
					onclick={() => select(n)}
					onkeydown={(e) => e.key === 'Enter' && select(n)}
					tabindex="0"
					role="button"
					aria-label={n.ring === 0 ? `${n.title} – Infoseite öffnen` : `${n.title} – Map zentrieren`}
				>
					<circle cx={n.x} cy={n.y} r={n.r + 3} class="ring" vector-effect="non-scaling-stroke" />
					{#if n.poster}
						<image
							href={img(n.poster, n.ring <= 1 ? 'w185' : 'w92')}
							x={n.x - n.r}
							y={n.y - n.r * 1.5}
							width={n.r * 2}
							height={n.r * 3}
							preserveAspectRatio="xMidYMid slice"
							clip-path="url(#clip-{n.id})"
						/>
					{/if}
					{#if (visibleLabels.has(n.id) || focused === n.id) && hovered !== n.id}
						<text
							x={n.x}
							y={n.y + n.r + (4 + FONT[n.ring]) / view.k}
							font-size={FONT[n.ring] / view.k}
							stroke-width={3 / view.k}
							text-anchor="middle">{label(n.title)}</text
						>
					{/if}
				</g>
			{/each}

			<!-- Titel des Films unter der Maus immer ganz, zuoberst -->
			{#if hoveredNode}
				<text
					class="hover-label"
					x={hoveredNode.x}
					y={hoveredNode.y + hoveredNode.r + 19 / view.k}
					font-size={14 / view.k}
					stroke-width={4 / view.k}
					text-anchor="middle"
					>{hoveredNode.title}{hoveredNode.year ? ` (${hoveredNode.year})` : ''}</text
				>
			{/if}
		</g>
	</svg>

	{#if searchable}
		<div class="overlay left">
			<MapSearch nodes={layout.nodes} onpick={onSearchPick} />
		</div>
	{/if}
	<div class="overlay right">
		<div class="controls">
			<button onclick={() => fly(() => zoomAt(1.4))} aria-label="Hineinzoomen" title="Hineinzoomen">+</button>
			<button onclick={() => fly(() => zoomAt(1 / 1.4))} aria-label="Herauszoomen" title="Herauszoomen">−</button>
			<button onclick={() => fly(resetView)} aria-label="Ansicht zurücksetzen" title="Ansicht zurücksetzen">⌖</button>
		</div>
	</div>

	{#if showWheelHint}
		<div class="wheel-hint">
			<span>Zum Zoomen <kbd>Strg</kbd> / <kbd>⌘</kbd> + Scrollen oder + / − verwenden</span>
		</div>
	{/if}

	<div class="hint">
		{#if override}
			<button class="btn btn-ghost small" onclick={() => ((override = null), resetView())}>↺ Zurück</button>
		{/if}
		<span>Ziehen zum Bewegen · Klick auf einen Film zentriert die Map · Klick auf die Mitte öffnet die Infoseite</span>
	</div>
</div>

<style>
	.map {
		position: relative;
		overflow: hidden;
		height: clamp(440px, 62vw, 640px);
		padding: 0;
	}

	svg {
		position: absolute;
		inset: 0;
		display: block;
		cursor: grab;
		touch-action: none; /* eigene Gesten statt Browser-Scrollen auf der Map */
		user-select: none;
		-webkit-user-select: none;
	}

	svg.dragging {
		cursor: grabbing;
	}

	.loading svg {
		opacity: 0.4;
		transition: opacity 0.2s;
	}

	.camera.flying {
		transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.orbit {
		fill: none;
		stroke: rgba(255, 255, 255, 0.05);
		stroke-width: 1;
		stroke-dasharray: 3 6;
	}

	line {
		stroke: rgba(255, 255, 255, 0.14);
		stroke-width: 1.2;
		transition: stroke 0.2s;
	}

	line.cross {
		stroke: rgba(255, 255, 255, 0.06);
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

	.dragging .node {
		cursor: grabbing;
	}

	.node.dim {
		opacity: 0.4;
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
		font-weight: 500;
		paint-order: stroke;
		stroke: rgba(13, 16, 23, 0.9);
		pointer-events: none;
	}

	.ring-0 text {
		font-weight: 700;
	}

	.ring-2 text,
	.ring-3 text {
		fill: var(--text-dim);
	}

	.hover-label {
		font-weight: 700;
		fill: #fff;
	}

	/* Schwebende Bedienelemente oben rechts, wie bei Apple/Google Maps */
	.overlay {
		position: absolute;
		top: 0.9rem;
		z-index: 2;
	}

	.overlay.left {
		left: 0.9rem;
	}

	.overlay.right {
		right: 0.9rem;
	}

	.controls {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border-radius: 14px;
		background: rgba(30, 34, 44, 0.55);
		border: 1px solid rgba(255, 255, 255, 0.14);
		backdrop-filter: blur(28px) saturate(180%);
		-webkit-backdrop-filter: blur(28px) saturate(180%);
		box-shadow:
			0 10px 30px rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.08);
	}

	/* Gesuchter Film leuchtet kurz auf */
	.node.focused .ring {
		stroke: var(--accent);
		stroke-width: 4;
		animation: pulse 0.9s ease-in-out 3;
	}

	@keyframes pulse {
		50% {
			stroke-opacity: 0.25;
		}
	}

	.controls button {
		width: 38px;
		height: 38px;
		border: 0;
		background: transparent;
		color: var(--text);
		font: inherit;
		font-size: 1.2rem;
		cursor: pointer;
		transition: background 0.2s;
	}

	.controls button + button {
		border-top: 1px solid var(--glass-border);
	}

	.controls button:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.wheel-hint {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		background: rgba(0, 0, 0, 0.35);
		pointer-events: none;
		animation: fade 0.2s ease-out;
	}

	.wheel-hint span {
		padding: 0.7rem 1.1rem;
		border-radius: 999px;
		background: rgba(24, 28, 37, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.14);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		color: #fff;
		font-size: 0.9rem;
		font-weight: 500;
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
	}

	kbd {
		font: inherit;
		font-size: 0.85em;
		padding: 0.1rem 0.4rem;
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.35);
	}

	.hint {
		position: absolute;
		left: 1rem;
		right: 4rem;
		bottom: 0.9rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.78rem;
		color: var(--text-dim);
		pointer-events: none;
	}

	.hint button {
		pointer-events: auto;
	}

	.small {
		padding: 0.35rem 0.8rem;
		font-size: 0.8rem;
	}
</style>
