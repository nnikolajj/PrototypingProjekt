import { search } from '#lib/server/tmdb.js';

export async function load({ url }) {
	const q = url.searchParams.get('q')?.trim() ?? '';
	return { q, movies: q ? await search(q) : [] };
}
