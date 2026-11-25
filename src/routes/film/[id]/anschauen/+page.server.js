import { error, redirect } from '@sveltejs/kit';
import { movie } from '#lib/server/tmdb.js';
import { getCurrentProfile, canWatch } from '#lib/server/session.js';

export async function load({ params, locals, url }) {
	if (!/^\d+$/.test(params.id)) error(404, 'Film nicht gefunden');
	const profile = await getCurrentProfile(locals);
	if (!profile) redirect(303, `/login?weiter=${encodeURIComponent(url.pathname)}`);
	// Nur Friends und Admins dürfen schauen – alle anderen zurück zur Infoseite.
	if (!canWatch(profile.role)) redirect(303, `/film/${params.id}`);
	return { movie: await movie(params.id) };
}
