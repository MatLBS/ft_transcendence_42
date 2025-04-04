import { createLocalDb, findUser } from '../dist/prisma/seed.js';
import { authenticateUser } from "./tokens.js";


export const createLocal = async (req, reply) => {

	let players = []

	const response = await authenticateUser(req);
	const player1 = await findUser(response.user.username);

	players.push(player1.username);
	players.push(req.body.player2);

	try {
		await createLocalDb(players)
	} catch (error) {
		return reply.send({message: error.message});
	}

}