import { app } from "../server.js";
import { authenticateUser } from "./tokens.js";
import { getFollowers } from "../dist/prisma/friends.js";
import { findUserById, findUser } from "../dist/prisma/seed.js";

export const sendStatus = async (userId, status) => {
	const user = await findUserById(userId);
	if ((!user) || (user.isOnline && status === "online") || (!user.isOnline && status === "offline")) {
		return;
	}

	const friends = await getFollowers(userId);
	if (!friends) {
		return;
	}
	friends.forEach((friend) => {
		const client = app.wsClients.get(friend.id);
		if (client) {
			client.send(JSON.stringify({
				type: 'status',
				friendId: userId,
				status: status,
			}));
		}
	});
};

export const webSocketConnect = async (socket, req) => {
	try {
		const response = await authenticateUser(req);

		if (response.status !== 200) {
			console.log('Unauthorized access attempt');
			return;
		}
		const userId = response.user.id;

		app.wsClients.set(userId, socket);
		socket.on('close', () => {
			app.wsClients.delete(userId);
		});

		socket.on('error', (err) => {
			console.error(`WebSocket error for user ${userId}:`, err);
			socket.close(1011, 'Internal error');
		});
	}
	catch (error) {
		console.error('Error establishing WebSocket connection:', error);
	}
}

export const webSocketConnectNewGame = async (socket, req) => {
	try {
		const urlParts = req.url.split('/');
		const usernameToFind = urlParts[urlParts.length - 1];

		const username = await findUser(usernameToFind)
		const userId = username.id;
		app.wsClients.set(userId, socket);

		socket.on('close', () => {
			app.wsClients.delete(userId);
		});

		socket.on('error', (err) => {
			console.error(`WebSocket error for user ${userId}:`, err);
			socket.close(1011, 'Internal error');
		});
	}
	catch (error) {
		console.error('Error establishing WebSocket connection:', error);
	}
}

export const webSocketConnectMessages = async (socket, req) => {
	try {
		const response = await authenticateUser(req);
		if (response.status !== 200) {
			console.log('Unauthorized access attempt');
			return;
		}
		const urlParts = req.url.split('/');
		const targetName = urlParts[urlParts.length - 1];
		const target = await findUser(targetName)
		const userId = response.user.id;
		const targetId = target.id;

		const keys = [userId, targetId].sort().join(':');
		if (!app.wsClients.has(keys)) {
			app.wsClients.set(keys, []);
		}
		app.wsClients.get(keys).push({
			socket: socket,
			userId: userId,
		});

		socket.on('close', () => {
			const sockets = app.wsClients.get(keys) || [];
			const filtered = sockets.filter(s => s !== socket);
			if (filtered.length > 0) {
				app.wsClients.set(keys, filtered);
			} else {
				app.wsClients.delete(keys);
			}
			console.log(`Socket closed for conversation ${keys}`);
		});

		socket.on('error', (err) => {
			console.error(`WebSocket error for conversation ${keys}:`, err);
			socket.close(1011, 'Internal error');
		});
	}
	catch (error) {
		console.error('Error establishing WebSocket connection:', error);
	}
}