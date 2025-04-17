import { createSoloDb, isUserExist, getMaxId, fillSoloDb } from '../dist/prisma/seed.js';
import { authenticateUser } from "./tokens.js";


export const createSolo = async (req, reply) => {

    // let players = []

    // const response = await authenticateUser(req);
    // const player1 = await isUserExist(response.user.username);

    // players.push(player1.username);
    // players.push("AI");

    try {
        await createSoloDb()
    } catch (error) {
        return reply.send({message: error.message});
    }

}

export async function setSolo(winner, loser, scoreWinner, scoreLoser) {
    try {
        const id = await getMaxId("solo");
        await fillSoloDb(id, winner, loser, scoreWinner, scoreLoser);
    } catch (error) {
        return reply.send({message: error.message});
    }
}