import { json } from '@sveltejs/kit';
import { search } from '#lib/server/tmdb.js';

/** Schnelle Filmsuche für Vorschläge (z.B. Suche in der Film-Map). */
export async function GET({ url, setHeaders }) {
	const q = url.searchParams.get('q')?.trim() ?? '';
	if (q.length < 2) return json([]);
	setHeaders({ 'cache-control': 'public, max-age=600' });
	const movies = await search(q);
	return json(movies.filter((/** @type {{ poster: string | null }} */ m) => m.poster).slice(0, 6));
}
