/**
 * Hilfsfunktionen rund um Login, eingeloggten User und Profilbild (Supabase).
 */

/** Username-Regeln wie in der Datenbank (Check-Constraint in supabase/schema.sql). */
export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

/**
 * Supabase Auth braucht eine E-Mail. Damit sich User nur mit Username anmelden
 * können, bekommt jeder intern eine Platzhalter-Adresse. Es werden keine Mails verschickt
 * (dafür muss "Confirm email" in Supabase ausgeschaltet sein).
 * @param {string} username
 */
export const loginEmail = (username) => `${username}@users.bragirium.app`;

/**
 * Lädt den eingeloggten User samt Profil, oder null.
 * @param {App.Locals} locals
 */
export async function getCurrentProfile(locals) {
	const user = await locals.getUser();
	if (!user) return null;

	const { data } = await locals.supabase
		.from('profiles')
		.select('id, username, name, avatar_url, created_at, role')
		.eq('id', user.id)
		.single();

	return data;
}

/** Rollen wie in der Datenbank (Check-Constraint in supabase/schema.sql). */
export const ROLES = /** @type {const} */ (['user', 'friend', 'admin']);

/** Darf diese Rolle Filme schauen? @param {string | null | undefined} role */
export const canWatch = (role) => role === 'friend' || role === 'admin';

/** Erlaubte Bildtypen und Maximalgrösse für Profilbilder (wie im Storage-Bucket). */
const AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

/**
 * Prüft eine hochgeladene Datei. Gibt eine Fehlermeldung zurück oder null.
 * @param {File | null} file
 */
export function avatarError(file) {
	if (!file || file.size === 0) return null;
	if (!AVATAR_TYPES.includes(file.type)) return 'Bitte ein PNG-, JPG-, WebP- oder GIF-Bild wählen.';
	if (file.size > AVATAR_MAX_BYTES) return 'Das Bild darf höchstens 2 MB gross sein.';
	return null;
}

/**
 * Lädt ein Profilbild in den Ordner des Users hoch, speichert die URL im Profil
 * und löscht ältere Bilder des Users. Gibt eine Fehlermeldung zurück oder null.
 * @param {App.Locals['supabase']} supabase
 * @param {string} userId
 * @param {File} file
 */
export async function uploadAvatar(supabase, userId, file) {
	const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
	const path = `${userId}/${Date.now()}.${ext}`;
	const bucket = supabase.storage.from('avatars');

	const { error: upErr } = await bucket.upload(path, file, { contentType: file.type });
	if (upErr) return `Upload fehlgeschlagen: ${upErr.message}`;

	const {
		data: { publicUrl }
	} = bucket.getPublicUrl(path);

	const { error: dbErr } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);
	if (dbErr) return `Profil konnte nicht gespeichert werden: ${dbErr.message}`;

	const { data: files } = await bucket.list(userId);
	const stale = (files ?? []).map((f) => `${userId}/${f.name}`).filter((p) => p !== path);
	if (stale.length) await bucket.remove(stale);

	return null;
}

/** Nur interne Pfade als Weiterleitungsziel erlauben (kein Open Redirect). @param {string | null} v */
export const safeTarget = (v) => (v && v.startsWith('/') && !v.startsWith('//') ? v : '/profil');
