import { authenticateUser } from "./tokens.js";
import { findUserById, findUser, getAllMessagesDb, enterNewMessageDb } from '../dist/prisma/seed.js';
import { app } from "../server.js";

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
        const targetId = await enterNewMessageDb(newMessage, response.user.id, targetName)
        const key = [response.user.id, targetId].sort().join(':');
        const sockets = app.wsClients.get(key);
        if (sockets && sockets.length) {
            sockets.forEach(({ socket, userId }) => {
                socket.send(JSON.stringify({
                    type: 'newMessage',
                    newMessage: newMessage,
                    userLogInId: response.user.id,
                    targetId: targetId,
                    actualUser: userId
                }));
            });
        }
    } catch (error) {
        return reply.send({message: error.message});
    }
}