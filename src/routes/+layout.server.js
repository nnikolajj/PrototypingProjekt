import { getCurrentProfile } from '#lib/server/session.js';

export async function load({ locals }) {
	return { user: await getCurrentProfile(locals) };
}
