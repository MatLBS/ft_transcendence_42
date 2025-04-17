import { createLocalDb, isUserExist, getMaxIdLocal, fillLocalDb} from '../dist/prisma/seed.js';
import { authenticateUser } from "./tokens.js";


export const createLocal = async (req, reply) => {

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

export async function setLocal(req, reply) {
	try {
		const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
		const winner = body.winner;
		const loser = body.loser;
		const winnerScore = body.winnerScore;
		const loserScore = body.loserScore;
		const id = await getMaxIdLocal();
		await fillLocalDb(id, winner, loser, winnerScore,loserScore);
	} catch (error) {
		return reply.send({message: error.message});
	}
}
