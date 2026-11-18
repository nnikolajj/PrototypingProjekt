import { error } from '@sveltejs/kit';
import { genres, byGenre } from '#lib/server/tmdb.js';

export async function load({ params, url }) {
	const id = Number(params.id);
	const page = Math.max(1, Number(url.searchParams.get('seite')) || 1);
	const [all, list] = await Promise.all([genres(), byGenre(id, page)]);
	const genre = all.find((g) => g.id === id);
	if (!genre) error(404, 'Genre nicht gefunden');
	return { genre, page, ...list };
}
