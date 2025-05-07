import { authenticateUser } from "./tokens.js";
import { findUserById, findUser, getAllMessagesDb } from '../dist/prisma/seed.js';

export const getAllMessages = async (req, reply) => {
    try {
        const targetName = req.body.target;
        const response = await authenticateUser(req);
        const messages = await getAllMessagesDb(response.user.id, targetName)
        reply.send(messages)
    } catch (error) {
        return reply.send({message: error.message});
    }
}