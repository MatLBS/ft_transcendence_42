import { authenticateUser } from "./tokens.js";
import { findUser, findUserById } from "../dist/prisma/seed.js";

export const getUser = async (req , reply) => {
	const response = await authenticateUser(req);
	const username = await findUserById(response.user.id)
	if (!username)
		return;
	reply.send({ user: { username: username.username } });
}

export const getUserId = async (req , reply) => {
	const response = await authenticateUser(req);
	reply.send({ userId: response.user.id});
}

export const getUserBackend = async (req , reply) => {
	const response = await authenticateUser(req);
	return (response.user.username);
}

export const getExternalUser = async (req , reply) => {
	let username;
	let user;
	try {
			username = decodeURIComponent(req.url.split("/").pop());
			user = await findUser(username);
			if (!user) {
				return ({ status: 404 });
			}
		} catch (error) {
			console.error(error);
			reply.send({ message: "Une erreur est survenue" });
		}
	return({ status: 200, id: user.id, username: user.username });
}
