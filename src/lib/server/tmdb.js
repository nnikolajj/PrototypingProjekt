import { TMDB_API_KEY } from '$app/env/private';
import { error } from '@sveltejs/kit';

const BASE = 'https://api.themoviedb.org/3';
const LANG = 'de-DE';
const REGION = 'CH';

/**
 * Ruft einen TMDB-Endpunkt auf. Unterstützt v3-Key (Query-Parameter)
 * und v4-Read-Token (Bearer-Header, erkennbar an der JWT-Form).
 * @param {string} path
 * @param {Record<string, string | number>} [params]
 */
async function tmdb(path, params = {}) {
	if (!TMDB_API_KEY) {
		error(500, 'TMDB_API_KEY fehlt. Lege eine .env-Datei an (siehe .env.example).');
	}

	const url = new URL(BASE + path);
	url.searchParams.set('language', LANG);
	for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

	/** @type {Record<string, string>} */
	const headers = { accept: 'application/json' };
	if (TMDB_API_KEY.startsWith('eyJ')) headers.authorization = `Bearer ${TMDB_API_KEY}`;
	else url.searchParams.set('api_key', TMDB_API_KEY);

	const res = await fetch(url, { headers });
	if (!res.ok) error(res.status === 404 ? 404 : 502, `TMDB-Fehler ${res.status} bei ${path}`);
	return res.json();
}

/** @param {any} m */
const slim = (m) => ({
	id: m.id,
	title: m.title,
	poster: m.poster_path,
	backdrop: m.backdrop_path,
	year: m.release_date?.slice(0, 4) ?? '',
	rating: Math.round((m.vote_average ?? 0) * 10) / 10,
	popularity: m.popularity ?? 0
});

/** Tagesauswahl: 3 Filme aus den Trends, pro Tag stabil gemischt. */
export async function todaysPicks() {
	const { results } = await tmdb('/trending/movie/day');
	const pool = results.filter((/** @type {any} */ m) => m.poster_path);
	const day = Math.floor(Date.now() / 86_400_000);
	const picks = [];
	for (let i = 0; i < 3 && pool.length; i++) {
		picks.push(pool.splice((day * 7 + i * 13) % pool.length, 1)[0]);
	}
	return picks.map(slim);
}

/** @param {string} query */
export async function search(query) {
	const { results } = await tmdb('/search/movie', { query, include_adult: 'false' });
	return results.map(slim);
}

export async function genres() {
	const { genres } = await tmdb('/genre/movie/list');
	return /** @type {{id:number,name:string}[]} */ (genres);
}

/** @param {number} genreId @param {number} page */
export async function byGenre(genreId, page = 1) {
	const data = await tmdb('/discover/movie', {
		with_genres: genreId,
		sort_by: 'popularity.desc',
		'vote_count.gte': 100,
		page
	});
	return { movies: data.results.map(slim), totalPages: Math.min(data.total_pages, 500) };
}

/** Top 100: die ersten 5 Seiten von "top_rated" (je 20 Filme). */
export async function top100() {
	const pages = await Promise.all([1, 2, 3, 4, 5].map((page) => tmdb('/movie/top_rated', { page })));
	return pages.flatMap((p) => p.results).map(slim).slice(0, 100);
}

export async function newest() {
	const pages = await Promise.all(
		[1, 2].map((page) => tmdb('/movie/now_playing', { page, region: REGION }))
	);
	return pages
		.flatMap((p) => p.results)
		.map(slim)
		.sort((/** @type {any} */ a, /** @type {any} */ b) => b.year.localeCompare(a.year));
}

/** @param {string | number} id */
export async function movie(id) {
	const m = await tmdb(`/movie/${id}`, {
		append_to_response: 'videos,credits,watch/providers,recommendations',
		include_video_language: 'de,en,null'
	});

	const videos = /** @type {any[]} */ (m.videos?.results ?? []).filter((v) => v.site === 'YouTube');
	const trailer =
		videos.find((v) => v.type === 'Trailer' && v.iso_639_1 === 'de') ??
		videos.find((v) => v.type === 'Trailer') ??
		videos[0];

	const providers = m['watch/providers']?.results?.[REGION] ?? null;

	return {
		...slim(m),
		tagline: m.tagline,
		overview: m.overview,
		runtime: m.runtime,
		genres: /** @type {{id:number,name:string}[]} */ (m.genres),
		releaseDate: m.release_date,
		voteCount: m.vote_count,
		director: m.credits?.crew?.find((/** @type {any} */ c) => c.job === 'Director')?.name ?? null,
		cast: (m.credits?.cast ?? []).slice(0, 8).map((/** @type {any} */ c) => ({
			name: c.name,
			character: c.character,
			profile: c.profile_path
		})),
		trailerKey: trailer?.key ?? null,
		providers: providers && {
			link: providers.link,
			flatrate: providers.flatrate ?? [],
			rent: providers.rent ?? [],
			buy: providers.buy ?? []
		},
		recommendations: (m.recommendations?.results ?? []).slice(0, 12).map(slim)
	};
}

/**
 * Daten für die Film-Map: ein Zentrum, seine Empfehlungen (Ring 1)
 * und je ein paar Empfehlungen der stärksten Nachbarn (Ring 2).
 * @param {number} centerId
 */
export async function movieMap(centerId) {
	const center = await tmdb(`/movie/${centerId}`, { append_to_response: 'recommendations' });
	const ring1 = (center.recommendations?.results ?? []).filter((/** @type {any} */ m) => m.poster_path).slice(0, 10);

	/** @type {Map<number, any>} */
	const nodes = new Map([[center.id, { ...slim(center), ring: 0 }]]);
	/** @type {{source:number,target:number}[]} */
	const links = [];

	for (const m of ring1) {
		nodes.set(m.id, { ...slim(m), ring: 1 });
		links.push({ source: center.id, target: m.id });
	}

	const second = await Promise.all(
		ring1.slice(0, 4).map((/** @type {any} */ m) => tmdb(`/movie/${m.id}/recommendations`).catch(() => ({ results: [] })))
	);
	second.forEach((res, i) => {
		for (const m of res.results.filter((/** @type {any} */ r) => r.poster_path).slice(0, 4)) {
			if (!nodes.has(m.id)) nodes.set(m.id, { ...slim(m), ring: 2 });
			links.push({ source: ring1[i].id, target: m.id });
		}
	});

	return { nodes: [...nodes.values()], links };
}
