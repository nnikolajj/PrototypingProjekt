import { redirect } from '@sveltejs/kit';
import { getUser, clearUser } from '#lib/server/session.js';

export function load({ cookies }) {
	if (!getUser(cookies)) redirect(303, '/login');
}

export const actions = {
	logout: ({ cookies }) => {
		clearUser(cookies);
		redirect(303, '/');
	}
};
