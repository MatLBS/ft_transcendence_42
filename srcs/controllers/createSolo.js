import { createSoloDb, isUserExist, getMaxId, fillSoloDb } from '../dist/prisma/seed.js';
import { authenticateUser } from "./tokens.js";


export const createSoloGame = async (req, reply) => {
    try {
        await createSoloDb()
    } catch (error) {
        return reply.send({message: error.message});
    }
}

export async function updateResultSoloGame(req, reply) {
    try {
        const winner = req.body.winner;
        const loser = req.body.loser;
        const winnerScore = req.body.winnerScore;
        const loserScore = req.body.loserScore;
        const id = await getMaxId("solo");
        await fillSoloDb(id, winner, loser, winnerScore, loserScore);
    } catch (error) {
        return reply.send({message: error.message});
    }
}