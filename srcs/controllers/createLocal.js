import { createLocalDb, findUser } from '../dist/prisma/seed.js';
import { authenticateUser } from "./tokens.js";


export const createLocal = async (req, reply) => {

	const response = await authenticateUser(req);

    const player1 = await findUser(response.user.username);
        
    const player2 = req.body.player2;

    try {
        await createLocalDb(player1.username, player2)
    } catch (error) {
		return reply.send({message: error.message});
	}

}