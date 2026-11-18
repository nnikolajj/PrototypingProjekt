import { fail, redirect } from '@sveltejs/kit';
import { setUser } from '#lib/server/session.js';

/** Nur interne Pfade als Weiterleitungsziel erlauben. @param {string | null} v */
const safeTarget = (v) => (v && v.startsWith('/') && !v.startsWith('//') ? v : '/profil');

export const actions = {
	default: async ({ request, cookies, url }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const email = String(form.get('email') ?? '').trim();
		const password = String(form.get('password') ?? '');
		const human = form.get('human') === 'on';

		/** @type {Record<string, string>} */
		const errors = {};
		if (name.length < 2) errors.name = 'Bitte gib deinen Namen ein.';
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Bitte gib eine gültige E-Mail ein.';
		if (password.length < 6) errors.password = 'Mindestens 6 Zeichen.';
		if (!human) errors.human = 'Bitte bestätige, dass du kein Roboter bist.';

		if (Object.keys(errors).length) return fail(400, { name, email, errors });

		// Prototyp: Das Passwort wird nicht gespeichert, nur Name + E-Mail im Cookie.
		setUser(cookies, { name, email });
		redirect(303, safeTarget(url.searchParams.get('weiter')));
	}
};
