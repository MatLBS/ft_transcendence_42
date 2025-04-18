import { createLocalDb, isUserExist, getMaxId, fillLocalDb } from '../dist/prisma/seed.js';
import { authenticateUser } from "./tokens.js";


export const createLocalGame = async (req, reply) => {

	let players = []

	const response = await authenticateUser(req);
	const player1 = await isUserExist(response.user.username);

	players.push(player1.username);
	players.push(req.body.player2);

	try {
		await createLocalDb(players)
	} catch (error) {
		return reply.send({message: error.message});
	}
}

export async function updateResultLocalGame(req, reply) {
	try {
		const winner = req.body.winner;
		const loser = req.body.loser;
		const winnerScore = req.body.winnerScore;
		const loserScore = req.body.loserScore;
		const id = await getMaxId("local");
		await fillLocalDb(id, winner, loser, winnerScore, loserScore);
	} catch (error) {
		return reply.send({message: error.message});
	}
}
