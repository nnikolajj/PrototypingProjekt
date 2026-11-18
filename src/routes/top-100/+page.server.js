import { top100 } from '#lib/server/tmdb.js';

export async function load() {
	return { movies: await top100() };
}
