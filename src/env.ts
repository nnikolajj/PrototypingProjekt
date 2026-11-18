import { defineEnvVars } from '@sveltejs/kit/env';

/** Optionale Variable: leerer Wert zählt als "nicht gesetzt". */
const optional = (value: string | undefined) => value || undefined;

export const variables = defineEnvVars({
	TMDB_API_KEY: {
		description:
			'TMDB API Key (v3) oder API Read Access Token (v4). Zu finden unter https://www.themoviedb.org/settings/api',
		schema: optional
	},
	PUBLIC_SUPABASE_URL: {
		public: true,
		description: 'Supabase-Projekt-URL, z.B. https://<projekt-id>.supabase.co',
		schema: optional
	},
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: {
		public: true,
		description:
			'Supabase Publishable Key (sb_publishable_…). Darf öffentlich sein, die Daten schützt Row Level Security.',
		schema: optional
	},
	PUBLIC_TURNSTILE_SITE_KEY: {
		public: true,
		description:
			'Cloudflare Turnstile Site Key (öffentlich). Der Secret Key gehört NICHT hierher, sondern ins Supabase-Dashboard.',
		schema: optional
	}
});
