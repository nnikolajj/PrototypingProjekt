<!--
	Bragi ist der nordische Gott der Dichtkunst und wird mit einer Harfe/Leier dargestellt.
	Das Logo ist eine stilisierte Leier mit Saiten.
-->
<script>
	let { size = 34 } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
	<defs>
		<linearGradient id="lyre-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
			<stop offset="0" stop-color="#5ac8fa" />
			<stop offset="1" stop-color="#0a84ff" />
		</linearGradient>
	</defs>
	<!-- Arme der Leier -->
	<path
		d="M14 40c-5-6-7-14-4-22 1.5-4 4.5-7 8-8 1 3-1 5-2.5 7-2.5 4-2 10 1.5 15"
		stroke="url(#lyre-grad)"
		stroke-width="3"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<path
		d="M34 40c5-6 7-14 4-22-1.5-4-4.5-7-8-8-1 3 1 5 2.5 7 2.5 4 2 10-1.5 15"
		stroke="url(#lyre-grad)"
		stroke-width="3"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<!-- Querjoch und Resonanzkörper -->
	<path d="M13 16h22" stroke="url(#lyre-grad)" stroke-width="3" stroke-linecap="round" />
	<path d="M14 40h20" stroke="url(#lyre-grad)" stroke-width="3" stroke-linecap="round" />
	<!-- Saiten -->
	<g stroke="#9fd2ff" stroke-width="1.4" stroke-linecap="round" opacity="0.9">
		<path d="M20 16v24" />
		<path d="M24 16v24" />
		<path d="M28 16v24" />
	</g>
</svg>
