import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	TMDB_API_KEY: {
		description:
			'TMDB API Key (v3) oder API Read Access Token (v4). Zu finden unter https://www.themoviedb.org/settings/api',
		schema: (value) => value || undefined
	}
});
