import { fail, redirect } from '@sveltejs/kit';
import { USERNAME_RE, loginEmail, safeTarget } from '#lib/server/session.js';

export async function load({ locals, url }) {
	if (await locals.getUser()) redirect(303, safeTarget(url.searchParams.get('weiter')));
}

/** Token des Cloudflare-Turnstile-Widgets aus dem Formular. @param {FormData} form */
const captchaToken = (form) => String(form.get('cf-turnstile-response') ?? '') || undefined;

/**
 * Fehler, die bei Login und Registrierung gleich behandelt werden.
 * @param {{ code?: string, message: string }} error
 */
function commonMessage(error) {
	if (/captcha/i.test(error.message)) return 'Captcha fehlgeschlagen. Bitte versuche es nochmals.';
	// Der Username-Login läuft intern über den E-Mail-Provider von Supabase.
	if (error.code === 'email_provider_disabled') {
		return 'Login ist auf dem Server nicht aktiviert (Supabase: Email-Provider ist ausgeschaltet).';
	}
	return null;
}

export const actions = {
	login: async ({ request, locals, url }) => {
		const form = await request.formData();
		const username = String(form.get('username') ?? '').trim().toLowerCase();
		const password = String(form.get('password') ?? '');

		if (!username || !password) {
			return fail(400, { mode: 'login', username, message: 'Bitte Username und Passwort eingeben.' });
		}

		const { error } = await locals.supabase.auth.signInWithPassword({
			email: loginEmail(username),
			password,
			options: { captchaToken: captchaToken(form) }
		});

		if (error) {
			const message = commonMessage(error) ?? 'Username oder Passwort ist falsch.';
			return fail(400, { mode: 'login', username, message });
		}

		redirect(303, safeTarget(url.searchParams.get('weiter')));
	},

	register: async ({ request, locals, url }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const username = String(form.get('username') ?? '').trim().toLowerCase();
		const password = String(form.get('password') ?? '');
		const password2 = String(form.get('password2') ?? '');

		/** @type {Record<string, string>} */
		const errors = {};
		if (name.length < 2 || name.length > 60) errors.name = 'Bitte gib deinen Namen ein (2–60 Zeichen).';
		if (!USERNAME_RE.test(username)) errors.username = '3–20 Zeichen: Kleinbuchstaben, Zahlen und _';
		if (password.length < 8) errors.password = 'Mindestens 8 Zeichen.';
		else if (password !== password2) errors.password2 = 'Die Passwörter stimmen nicht überein.';

		if (!errors.username) {
			const { data: taken } = await locals.supabase
				.from('profiles')
				.select('id')
				.eq('username', username)
				.maybeSingle();
			if (taken) errors.username = 'Dieser Username ist schon vergeben.';
		}

		const values = { mode: 'register', name, username };
		if (Object.keys(errors).length) return fail(400, { ...values, errors });

		const { data, error } = await locals.supabase.auth.signUp({
			email: loginEmail(username),
			password,
			options: { data: { name, username }, captchaToken: captchaToken(form) }
		});

		if (error) {
			const message =
				commonMessage(error) ??
				(error.code === 'user_already_exists'
					? 'Dieser Username ist schon vergeben.'
					: error.code === 'weak_password'
						? 'Das Passwort ist zu schwach.'
						: `Registrierung fehlgeschlagen: ${error.message}`);
			return fail(400, { ...values, message });
		}

		if (!data.session) {
			// Passiert nur, wenn in Supabase "Confirm email" noch eingeschaltet ist.
			return fail(500, {
				...values,
				message: 'Konto erstellt, aber keine Session erhalten. In Supabase muss "Confirm email" ausgeschaltet sein.'
			});
		}

		redirect(303, safeTarget(url.searchParams.get('weiter')));
	}
};
