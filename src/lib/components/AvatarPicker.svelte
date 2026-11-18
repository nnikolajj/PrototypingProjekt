<!-- Dateiauswahl für ein Profilbild mit Live-Vorschau. -->
<script>
	import Avatar from './Avatar.svelte';

	/** @type {{ current?: string | null, name?: string, error?: string }} */
	let { current = null, name = '', error } = $props();

	/** @type {string | null} */
	let preview = $state(null);

	/** @param {Event & { currentTarget: HTMLInputElement }} e */
	function onChange(e) {
		const file = e.currentTarget.files?.[0];
		if (preview) URL.revokeObjectURL(preview);
		preview = file ? URL.createObjectURL(file) : null;
	}
</script>

<label class="picker">
	<Avatar url={preview ?? current} {name} size={64} />
	<span class="text">
		<strong>Profilbild</strong>
		<small class="muted">PNG, JPG, WebP oder GIF · max. 2 MB</small>
	</span>
	<span class="btn btn-ghost choose">Wählen</span>
	<input
		type="file"
		name="avatar"
		accept="image/png,image/jpeg,image/webp,image/gif"
		onchange={onChange}
	/>
</label>
{#if error}<small class="err">{error}</small>{/if}

<style>
	.picker {
		position: relative;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.8rem 1rem;
		border: 1px dashed var(--glass-border);
		border-radius: var(--radius-sm);
		background: rgba(0, 0, 0, 0.2);
		cursor: pointer;
		transition: border-color 0.2s;
	}

	.picker:hover,
	.picker:focus-within {
		border-color: var(--accent);
	}

	.text {
		display: flex;
		flex-direction: column;
		flex: 1;
		font-size: 0.9rem;
		color: var(--text);
	}

	.text small {
		font-size: 0.75rem;
	}

	.choose {
		padding: 0.45rem 0.9rem;
		font-size: 0.85rem;
	}

	input {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}

	.err {
		color: #ff6961;
		font-size: 0.85rem;
	}
</style>
