import { logUser } from '../dist/prisma/seed.js';
import { authenticateUser } from './tokens.js';
import jwt from 'jsonwebtoken';
import { sendStatus } from './webSocket.js';

export const logout = async (req, reply) => {
	const response = await authenticateUser(req);
	if (response.status !== 200) {
		return reply.redirect('/login');
	}
	await sendStatus(response.user.id, "offline");
	await logUser(response.user.id, false);
	reply
		.clearCookie('access_token')
		.clearCookie('refresh_token')
		.send({ status: 200 });
};

export const quit = async (req, reply) => {
	const response = await authenticateUser(req);
	if (response.status !== 200) {
		return reply.send({ status: response.status });
	}
	await sendStatus(response.user.id, "offline");
	await logUser(response.user.id, false);
};
