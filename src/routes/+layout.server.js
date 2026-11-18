import { getUser } from '#lib/server/session.js';

export function load({ cookies }) {
	return { user: getUser(cookies) };
}
