import { createTournamentDb,  getMaxId, fillTournamentDb, getTournamentById } from '../dist/prisma/seed.js';
import { findUsersTournament } from '../dist/prisma/seed.js';

function getRandomNumber(playerIds) {
	const randomIndex = Math.floor(Math.random() * playerIds.length);
	const randomNumber = playerIds[randomIndex];
	playerIds.splice(randomIndex, 1);
	return randomNumber;
}

async function createBrackets(players, tournamentId) {
	const tournament = await getTournamentById(tournamentId);
	const remainingPlayers = players.filter(player => player.NbVictory = tournament.currentRound - 1);
	const sortedPlayers = remainingPlayers.sort((a, b) => a.playerNumber - b.playerNumber);
	const nextMatch = []

	for (let i = 0; i < sortedPlayers.length; ++i) {
		if (sortedPlayers[i].playerNumber % 2 === 0) {
			nextMatch.push(sortedPlayers[i].name);
			nextMatch.push(sortedPlayers[i + 1].name);
			break;
		}
	}
	return nextMatch;
}

export const createTournament = async (req, reply) => {

	let playerIds = [];
	var playersInfos = new Map();

	for (let i = 1; i < req.body.playerData.length + 1; ++i)
		playerIds.push(i);

	for (let i = 0; i < req.body.playerData.length; ++i) {
		playersInfos.set(i, {
			name: req.body.playerData[i],
			NbVictory: 0,
			rank: 0,
			playerNumber: getRandomNumber(playerIds),
		});
	}

	let nbRounds;

	switch(req.body.playerData.length) {
		case 4: 
			nbRounds = 2
			break
		case 8:
			nbRounds = 3
			break
		default:
			nbRounds = 4
	}

	try {
		await createTournamentDb(playersInfos, nbRounds)
	} catch (error) {
		return reply.send({message: error.message});
	}
};

export async function nextMatchTournament() {
	try {
		const id = await getMaxId("tournament");

		const players = await findUsersTournament(id);
		const nextMatch = await createBrackets(players, id)
		return nextMatch;
	} catch (error) {
		return reply.send({message: error.message});
	}
}

export async function setTournament(req, reply) {
	try {
		const winner = req.body.winner;
		const loser = req.body.loser;
		const winnerScore = req.body.winnerScore;
		const loserScore = req.body.loserScore;
		const id = await getMaxId("tournament");
		await fillTournamentDb(id, winner, loser, winnerScore, loserScore);
	} catch (error) {
		return reply.send({message: error.message});
	}
}