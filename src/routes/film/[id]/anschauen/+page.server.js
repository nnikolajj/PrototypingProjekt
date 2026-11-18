import { error, redirect } from '@sveltejs/kit';
import { movie } from '#lib/server/tmdb.js';

export async function load({ params, locals, url }) {
	if (!(await locals.getUser())) redirect(303, `/login?weiter=${encodeURIComponent(url.pathname)}`);
	if (!/^\d+$/.test(params.id)) error(404, 'Film nicht gefunden');
	return { movie: await movie(params.id) };
}
