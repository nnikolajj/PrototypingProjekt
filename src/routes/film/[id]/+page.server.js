import { error } from '@sveltejs/kit';
import { movie } from '#lib/server/tmdb.js';

export async function load({ params }) {
	if (!/^\d+$/.test(params.id)) error(404, 'Film nicht gefunden');
	return { movie: await movie(params.id) };
}
