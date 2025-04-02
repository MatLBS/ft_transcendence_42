import { findUser } from '../dist/prisma/seed.js';
import { app } from '../server.js';
import { generateAccessToken, generateRefreshToken } from './tokens.js';

export const loginUser = async (req, reply) => {
	let accessToken, refreshToken;
	try {
		const user = await findUser(req.body.username);

		const validPassword = await app.bcrypt.compare(req.body.password, user.password);

		if (!validPassword)
			throw new Error(`Invalid password for user '${user.username}'`);

		accessToken = generateAccessToken(user);
		refreshToken = generateRefreshToken(user);

	} catch (error) {
		return reply.send({message: error.message});
	}
	return reply
		.setCookie('access_token', accessToken, {
			httpOnly: true,
			secure: false,
			sameSite: 'Strict'
		})
		.setCookie('refresh_token', refreshToken, {
			httpOnly: true,
			secure: false,
			sameSite: 'Strict'
		})
		.send({ message: "ok" });
};
