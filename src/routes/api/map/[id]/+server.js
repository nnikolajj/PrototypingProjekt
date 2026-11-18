import { json, error } from '@sveltejs/kit';
import { movieMap } from '#lib/server/tmdb.js';

export async function GET({ params, setHeaders }) {
	const id = Number(params.id);
	if (!Number.isInteger(id)) error(400, 'Ungültige Film-ID');
	setHeaders({ 'cache-control': 'public, max-age=3600' });
	return json(await movieMap(id));
}
