import { error, fail, redirect } from '@sveltejs/kit';
import { getCurrentProfile, ROLES, USERNAME_RE } from '#lib/server/session.js';

/** Nur Admins kommen auf diese Seite. @param {App.Locals} locals */
async function requireAdmin(locals) {
	const me = await getCurrentProfile(locals);
	if (!me) redirect(303, '/login?weiter=/admin');
	if (me.role !== 'admin') error(403, 'Diese Seite ist nur für Admins.');
	return me;
}

export async function load({ locals }) {
	const me = await requireAdmin(locals);
	const { data: users, error: err } = await locals.supabase
		.from('profiles')
		.select('id, username, name, avatar_url, role, created_at')
		.order('created_at', { ascending: true });
	if (err) error(500, `User konnten nicht geladen werden: ${err.message}`);
	return { me: me.id, users: users ?? [] };
}

export const actions = {
	setRole: async ({ request, locals }) => {
		await requireAdmin(locals);
		const form = await request.formData();
		const username = String(form.get('username') ?? '').trim().toLowerCase().replace(/^@/, '');
		const role = String(form.get('role') ?? '');

		if (!USERNAME_RE.test(username)) {
			return fail(400, { username, role, message: 'Bitte einen gültigen Username eingeben.' });
		}
		if (!(/** @type {readonly string[]} */ (ROLES)).includes(role)) {
			return fail(400, { username, role, message: 'Bitte eine Rolle wählen.' });
		}

		// Die eigentliche Prüfung (ist Admin? existiert User? nicht sich selbst?) macht die Datenbank.
		const { error: err } = await locals.supabase.rpc('set_user_role', {
			target_username: username,
			new_role: role
		});
		if (err) return fail(400, { username, role, message: err.message });

		return { success: `@${username} ist jetzt ${ROLE_LABEL[role]}.` };
	}
};

/** @type {Record<string, string>} */
const ROLE_LABEL = { user: 'User', friend: 'Friend', admin: 'Admin' };
