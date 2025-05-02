import Fastify from 'fastify';
import userRoutes from './router.js';
import {__dirname} from './router.js';
import fastifyBcrypt from 'fastify-bcrypt';
import fastifyCookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { v4 as uuidv4 } from 'uuid';

export const app = Fastify({
	// logger: true,
});

app.register(fastifyCookie);
app.register(websocket);

// Game state storage
const activeGames = new Map();
const matchmakingQueue = [];
const connectionMap = new Map();
app.get('/ws', { websocket: true }, (connection, req) => {
	const playerId = uuidv4();
	
	// Track new connection
	connectionMap.set(connection.socket, {
	  playerId,
	  roomId: null,
	  socket: connection.socket
	});
  
	connection.socket.on('message', (message) => {
	  try {
		const data = JSON.parse(message);
		const connectionData = connectionMap.get(connection.socket);
  
		switch (data.type) {
		  case 'JOIN_QUEUE':
			handleMatchmaking(connection.socket);
			break;
			
		  case 'GAME_INPUT':
			if (connectionData?.roomId) {
			  const room = activeGames.get(connectionData.roomId);
			  if (room) handlePlayerInput(room, playerId, data.position);
			}
			break;
			
		  case 'SYNC_REQUEST':
			if (connectionData?.roomId) {
			  const room = activeGames.get(connectionData.roomId);
			  if (room) sendGameState(room);
			}
			break;
		}
	  } catch (error) {
		console.error('Error processing message:', error);
	  }
	});
  
	connection.socket.on('close', () => {
	  const connectionData = connectionMap.get(connection.socket);
	  if (connectionData?.roomId) {
		cleanupDisconnectedPlayer(connectionData.roomId, playerId);
	  }
	  connectionMap.delete(connection.socket);
	  removeFromQueue(connection.socket);
	});
  });

function handleMatchmaking(socket) {
  matchmakingQueue.push(socket);
  
  if (matchmakingQueue.length >= 2) {
    const player1 = matchmakingQueue.shift();
    const player2 = matchmakingQueue.shift();
    createGameRoom(player1, player2);
  }
}

function createGameRoom(player1Socket, player2Socket) {
	const roomId = uuidv4();
	const newRoom = {
	  id: roomId,
	  players: [
		{ id: uuidv4(), socket: player1Socket, position: 0 },
		{ id: uuidv4(), socket: player2Socket, position: 0 }
	  ],
	  ballPosition: { x: 0, y: 0.5, z: 0 },
	  ballVelocity: { x: 0, y: 0, z: 0 }
	};
  
	// Update connection map for both players
	[player1Socket, player2Socket].forEach(socket => {
	  const data = connectionMap.get(socket);
	  if (data) data.roomId = roomId;
	});
  
	activeGames.set(roomId, newRoom);
  
	newRoom.players.forEach((player, index) => {
	  player.socket.send(JSON.stringify({
		type: 'GAME_START',
		playerNumber: index + 1,
		roomId
	  }));
	});
  }
  
  // Modified cleanupDisconnectedPlayer
  function cleanupDisconnectedPlayer(roomId, disconnectedPlayerId) {
	const room = activeGames.get(roomId);
	if (!room) return;
  
	const remainingPlayer = room.players.find(p => p.id !== disconnectedPlayerId);
	
	if (remainingPlayer) {
	  remainingPlayer.socket.send(JSON.stringify({
		type: 'OPPONENT_DISCONNECTED'
	  }));
	  
	  // Reset remaining player's room assignment
	  const connectionData = connectionMap.get(remainingPlayer.socket);
	  if (connectionData) connectionData.roomId = null;
	}
	
	activeGames.delete(roomId);
  }

function removeFromQueue(socket) {
  const index = matchmakingQueue.indexOf(socket);
  if (index !== -1) {
    matchmakingQueue.splice(index, 1);
  }
}

app.register(fastifyBcrypt);

app.register(cors, {
	origin: ["https://accounts.google.com", "http://localhost:3000", "ws://localhost:3000"], // Add allowed origins
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
	credentials: true, // Allow cookies to be sent with requests
});

app.register(fastifyMultipart, {
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB max file size
		files: 5, // Max number of files
	},
	attachFieldsToBody: false, // Ne pas attacher les champs au body, nous les traiterons avec req.parts()
});

app.register(userRoutes);

// lancer le serv
const start = async () => {
	try {
		// grace a fastify, on peut lancer le serveur avec listen
		await app.listen({
			port: 3000,
			host: "0.0.0.0",
		});
		console.log("Server is running on http://localhost:3000");
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

start();
