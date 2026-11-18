/**
 * Sehr einfache Prototyp-Session: Name und E-Mail im Cookie.
 * KEINE echte Authentifizierung – Passwörter werden nirgends gespeichert.
 */

const COOKIE = 'bragi_user';

/** @param {import('@sveltejs/kit').Cookies} cookies */
export function getUser(cookies) {
	const raw = cookies.get(COOKIE);
	if (!raw) return null;
	try {
		const { name, email } = JSON.parse(raw);
		return { name: String(name), email: String(email) };
	} catch {
		return null;
	}
}

/** @param {import('@sveltejs/kit').Cookies} cookies @param {{name:string,email:string}} user */
export function setUser(cookies, user) {
	cookies.set(COOKIE, JSON.stringify(user), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 30
	});
}

/** @param {import('@sveltejs/kit').Cookies} cookies */
export function clearUser(cookies) {
	cookies.delete(COOKIE, { path: '/' });
}
