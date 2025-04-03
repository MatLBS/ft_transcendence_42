import { createTournamentDb } from '../dist/prisma/seed.js';

function getRandomNumber(playerIds) {
	const randomIndex = Math.floor(Math.random() * playerIds.length);
	const randomNumber = playerIds[randomIndex];
	playerIds.splice(randomIndex, 1);
	return randomNumber;
}

export const createTournament = async (req, reply) => {

	let playerIds = [];
	var playersInfos = new Map();

	for (let i = 1; i < req.body.playerData.length + 1; ++i) {
		playerIds.push(i);
	}

	for (let i = 0; i < req.body.playerData.length; ++i) {
		playersInfos.set(i, {
			name: req.body.playerData[i],
			NbVictory: 0,
			rank: 0,
			playerNumber: getRandomNumber(playerIds),
		});
	}

	try {
		createTournamentDb(playersInfos)
	} catch (error) {
		return reply.send({message: error.message});
	}

};