import { findUserByEmail, findUser } from '../dist/prisma/seed.js';
import { app } from '../server.js';
import { generateAccessToken, generateRefreshToken } from './tokens.js';
import { sendEmail, generateCode, verifCode } from './email.js';

export const verifLogin = async (req, reply) => {
	const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
	const username = body.username;
	const password = body.password;

	const user = await findUser(username);
	if (!user) {
		return reply.send({ message: "User not found" });
	}

	if (user.password === null) {
		return reply.send({ message: "Please log in using Google." });
	}

	const validPassword = await app.bcrypt.compare(password, user.password);
	if (!validPassword)
		return reply.send({ message: `Invalid password for user '${user.username}'`});

	if (user.twoFactor === false) {
		return sendToken(req, reply, user, 0);
	}

	const code = await generateCode(req, reply);
	const response = await sendEmail(user.email, user.username, code.code);
	if (response.message !== "ok") {
		return reply.send({ message: response.message });
	}
	return reply
		.setCookie("code_id", code.codeId, {
			httpOnly: true,
			secure: false,
			sameSite: "lax",
			path: "/",
			maxAge: 240,
		})
		.send({ message: "twoFa" });
}

export const loginUser = async (req, reply, password, username) => {
	try {
		if (!username || !password) {
			return reply.send({message: "Missing username or password"});
		}

		const user = await findUser(username);
		if (!user) {
			return reply.send({ message: "User not found" });
		}

		const validPassword = await app.bcrypt.compare(password, user.password);

		if (!validPassword)
			throw new Error(`Invalid password for user '${user.username}'`);

		return sendToken(req, reply, user, 0);
	} catch (error) {
		return reply.send({message: error.message});
	}
}

export const login = async (req, reply) => {
	const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
	const response = await verifCode(req, reply, body.verif_email);
	if (response !== "ok") {
		return reply.send({ message: response, code: true });
	}
	return loginUser(req, reply, body.password, body.username);
};

export const loginUserGoogle = async (req, reply, email) => {
	try {
		const user = await findUserByEmail(email);
		if (!user) {
			return reply.send({ message: "email not found" });
		}

		return sendToken(req, reply, user, 1);
	} catch (error) {
		return reply.send({message: error.message});
	}
}

const sendToken = async (req, reply, user, isGoogle) => {
	const accessToken = generateAccessToken(user, isGoogle);
	const refreshToken = generateRefreshToken(user, isGoogle);
	reply
		.setCookie('access_token', accessToken, {
			httpOnly: false,
			secure: false,
			sameSite: 'lax',
			path: "/",
		})
		.setCookie('refresh_token', refreshToken, {
			httpOnly: true,
			secure: false,
			sameSite: 'lax',
			path: "/",
		})
		return isGoogle === 1 ? reply.redirect('/profil') : reply.send({ message: "ok" });
}
