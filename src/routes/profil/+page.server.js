import { fail, redirect } from '@sveltejs/kit';
import { avatarError, uploadAvatar } from '#lib/server/session.js';

export async function load({ locals }) {
	if (!(await locals.getUser())) redirect(303, '/login?weiter=/profil');
}

export const actions = {
	update: async ({ request, locals }) => {
		const user = await locals.getUser();
		if (!user) redirect(303, '/login?weiter=/profil');

		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const avatar = /** @type {File | null} */ (form.get('avatar'));

		/** @type {Record<string, string>} */
		const errors = {};
		if (name.length < 2 || name.length > 60) errors.name = 'Bitte gib deinen Namen ein (2–60 Zeichen).';
		const avErr = avatarError(avatar);
		if (avErr) errors.avatar = avErr;
		if (Object.keys(errors).length) return fail(400, { name, errors });

		const { error } = await locals.supabase.from('profiles').update({ name }).eq('id', user.id);
		if (error) return fail(500, { name, message: `Speichern fehlgeschlagen: ${error.message}` });

		if (avatar && avatar.size > 0) {
			const err = await uploadAvatar(locals.supabase, user.id, avatar);
			if (err) return fail(500, { name, message: err });
		}

		return { saved: true };
	},

	logout: async ({ locals }) => {
		await locals.supabase.auth.signOut();
		redirect(303, '/');
	}
};
