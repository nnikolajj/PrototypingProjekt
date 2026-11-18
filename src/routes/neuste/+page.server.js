import { newest } from '#lib/server/tmdb.js';

export async function load() {
	return { movies: await newest() };
}
