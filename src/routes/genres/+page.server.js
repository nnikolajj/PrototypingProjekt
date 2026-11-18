import { genres } from '#lib/server/tmdb.js';

export async function load() {
	return { genres: await genres() };
}
