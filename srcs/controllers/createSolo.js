import { createSoloDb, isUserExist, getMaxId, fillSoloDb, findUserById } from '../dist/prisma/seed.js';
import { authenticateUser } from "./tokens.js";
import { app } from "../server.js";


export const createSoloGame = async (req, reply) => {
	try {
		await createSoloDb()
	} catch (error) {
		return reply.send({message: error.message});
	}
}

export async function updateResultSoloGame(req, reply) {
	try {
		let user, winnerId, loserId;
		const response = await authenticateUser(req);
		if (response.status === 200)
			user = await findUserById(response.user.id);
		if (!user)
			return;
		const winner = req.body.winner.trim();
		const loser = req.body.loser.trim();
		const winnerScore = req.body.winnerScore;
		const loserScore = req.body.loserScore;
		if (user.username === winner) {
			winnerId = user.id;
			loserId = 0;
		} else {
			winnerId = 0;
			loserId = user.id;
		}
		const id = await getMaxId("solo");
		const soloParty = await fillSoloDb(id, winner, loser, winnerScore, loserScore, winnerId, loserId);
		const client = app.wsClients.get(response.user.id);
		if (client) {
			client.send(JSON.stringify({
				type: 'Solo',
				username: user.username,
				lastMatch: soloParty,
			}));
		}
	} catch (error) {
		return reply.send({message: error.message});
	}
}