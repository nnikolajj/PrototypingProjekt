import { todaysPicks, movieMap } from '#lib/server/tmdb.js';

export async function load() {
	const picks = await todaysPicks();
	return {
		picks,
		map: picks.length ? movieMap(picks[0].id) : Promise.resolve(null)
	};
}
