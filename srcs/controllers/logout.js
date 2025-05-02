import { logUser } from '../dist/prisma/seed.js';
import { authenticateUser } from './tokens.js';
import jwt from 'jsonwebtoken';

export const logout = async (req, reply) => {
	const response = await authenticateUser(req);
	if (response.status !== 200) {
		return reply.redirect('/login');
	}
	await logUser(response.user.id, false);
	reply
		.clearCookie('access_token')
		.clearCookie('refresh_token')
		.send({ status: 200 });
};

const getUsernameByToken = async (token) => {
	if (!token) {
		return { status: 401, user: null };
	}
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		return { status: 200, user: decoded };
	} catch (err) {
		return { status: 403, user: null };
	}
};

export const quit = async (req, reply) => {
	const { token } = JSON.parse(req.body);
	const response = await getUsernameByToken(token);
	if (response.status !== 200) {
		return reply.send({ status: response.status });
	}
	await logUser(response.user.id, false);
};
