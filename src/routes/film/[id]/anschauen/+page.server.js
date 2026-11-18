import { error, redirect } from '@sveltejs/kit';
import { movie } from '#lib/server/tmdb.js';
import { getUser } from '#lib/server/session.js';

export async function load({ params, cookies, url }) {
	if (!getUser(cookies)) redirect(303, `/login?weiter=${encodeURIComponent(url.pathname)}`);
	if (!/^\d+$/.test(params.id)) error(404, 'Film nicht gefunden');
	return { movie: await movie(params.id) };
}
