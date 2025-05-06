import { authenticateUser } from "./tokens.js";
import { findUser } from "../dist/prisma/seed.js";
import { getErrorPageDirect } from './errorPage.js';
import { isFriend, addFollow, removeFollow } from '../dist/prisma/friends.js';


export const addFriends = async (req, reply) => {
	try {
		const username = req.url.split("/").pop();
		const user = await findUser(username);
		if (!user) {
			return await getErrorPageDirect(req, reply);
		}

		const response = await authenticateUser(req);
		if (response.status !== 200) {
			return await getErrorPageDirect(req, reply); // code error
		}

		const himself = response.user.id === user.id;
		if (himself) {
			return reply.send({ message: "Vous ne pouvez pas vous ajouter en amis" });
		}

		const friend = await isFriend(response.user.id, user.id);
		if (friend) {
			return reply.send({ message: "Vous êtes déjà amis" });
		}

		const friendRequest = await addFollow(response.user.id, user.id);
		if (friendRequest.ok) {
			return reply.send({ ok: true, message: "Ami ajouté" });
		}
		reply.send({ message: "Erreur lors de la demande d'ami" });
	} catch (error) {
		console.error(error);
		reply.send({ message: "Une erreur est survenue" });
	}
}

export const deleteFriends = async (req, reply) => {
	try {
		const username = req.url.split("/").pop();
		const user = await findUser(username);
		if (!user) {
			return await getErrorPage(req, reply);
		}

		const response = await authenticateUser(req);
		if (response.status !== 200) {
			return await getErrorPage(req, reply); // code error
		}

		const friend = await isFriend(response.user.id, user.id);
		if (!friend) {
			return reply.send({ message: "Vous êtes pas encore amis" });
		}

		const deleteFriends = await removeFollow(response.user.id, user.id);
		if (deleteFriends.ok) {
			return reply.send({ ok: true, message: "L'ami a été supprimé de vos contact" });
		}
		reply.send({ message: "Erreur lors de la suppression de l'ami" });
	} catch (error) {
		console.error(error);
		reply.send({ message: "Une erreur est survenue" });
	}
}
