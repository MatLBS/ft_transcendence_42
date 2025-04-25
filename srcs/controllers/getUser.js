import { authenticateUser } from "./tokens.js";
import { findUser } from "../dist/prisma/seed.js";
import { getErrorPage } from "./errorPage.js";

export const getUser = async (req , reply) => {
	const response = await authenticateUser(req);
	reply.send({ user: { username: response.user.username } }); 
}

export const getUserBackend = async (req , reply) => {
	const response = await authenticateUser(req);
	return (response.user.username);
}

export const getExternalUser = async (req , reply) => {
	let username;
	let user;
	try {
			username = req.url.split("/").pop();
			user = await findUser(username);
			if (!user) {
				return await getErrorPage(req, reply);
			}
		} catch (error) {
			console.error(error);
			reply.send({ message: "Une erreur est survenue" });
		}
	return({ status: 200, id: user.id, username: user.username });
}
