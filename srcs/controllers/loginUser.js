import { findUser, findUserByEmail } from '../dist/prisma/seed.js';
import { app } from '../server.js';
import { generateAccessToken, generateRefreshToken } from './tokens.js';

export const loginUser = async (req, reply, password, username) => {
	let accessToken, refreshToken;
	try {
		if (!username || !password) {
			return reply.send({message: "Missing username or password"});
		}
		const user = await findUser(username);

		const validPassword = await app.bcrypt.compare(password, user.password);

		if (!validPassword)
			throw new Error(`Invalid password for user '${user.username}'`);

		accessToken = generateAccessToken(user, 0);
		refreshToken = generateRefreshToken(user, 0);

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
}

export const login = async (req, reply) => {
	const password = req.body.password;
	const username = req.body.username;
	return loginUser(req, reply, password, username);
};

export const loginUserGoogle = async (req, reply, email) => {
	let accessToken, refreshToken;
	try {
		const user = await findUserByEmail(email);
		console.log("user", user);

		accessToken = generateAccessToken(user, 1);
		refreshToken = generateRefreshToken(user, 1);

	} catch (error) {
		return reply.send({message: error.message});
	}
	return reply
		.setCookie('access_token', accessToken, {
			httpOnly: true,
			secure: false,
			sameSite: 'Strict',
			path: "/",
		})
		.setCookie('refresh_token', refreshToken, {
			httpOnly: true,
			secure: false,
			sameSite: 'Strict',
			path: "/",
		})
		.redirect('/profil');
}
