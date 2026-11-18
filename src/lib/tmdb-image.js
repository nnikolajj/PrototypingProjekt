/**
 * Baut eine TMDB-Bild-URL.
 * @param {string | null | undefined} path
 * @param {'w92'|'w185'|'w342'|'w500'|'w780'|'w1280'|'original'} [size]
 */
export function img(path, size = 'w342') {
	return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}
