import { authenticateUser } from "./tokens.js";
import { findUserById, findUser, getAllMessagesDb, enterNewMessageDb } from '../dist/prisma/seed.js';

export const getAllMessages = async (req, reply) => {
    try {
        const targetName = req.body.targetMessage;
        if (!targetName)
            return;
        const response = await authenticateUser(req);
        const messages = await getAllMessagesDb(response.user.id, targetName)
        reply.send(messages)
    } catch (error) {
        return reply.send({message: error.message});
    }
}

export const enterNewMessage = async (req, reply) => {
    try {
        const newMessage = req.body.newMessage;
        const targetName = req.body.targetMessage;
        if (!targetName)
            return;
        const response = await authenticateUser(req);
        enterNewMessageDb(newMessage, response.user.id, targetName)
    } catch (error) {
        return reply.send({message: error.message});
    }
}