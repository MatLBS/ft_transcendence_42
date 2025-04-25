import { createLocalDb, isUserExist, getMaxId, fillLocalDb, findUserById } from '../dist/prisma/seed.js';
import { authenticateUser } from "./tokens.js";


export const createLocalGame = async (req, reply) => {

	let players = []

	const response = await authenticateUser(req);
	const player1 = await isUserExist(response.user.username);

	if (req.body.player2.trim() === '' || req.body.player2.trim() === player1.username)
		return;

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
		let user, winnerId, loserId;
		const response = await authenticateUser(req);
		if (response.status === 200)
			user = await findUserById(response.user.id);
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
		const id = await getMaxId("local");
		await fillLocalDb(id, winner, loser, winnerScore, loserScore, winnerId, loserId);
	} catch (error) {
		return reply.send({message: error.message});
	}
}
