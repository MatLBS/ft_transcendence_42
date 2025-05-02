import { createTournamentDb,  getMaxId, fillTournamentDb, getTournamentById, hasAlreadyLose, findUserById } from '../dist/prisma/seed.js';
import { findUsersTournament } from '../dist/prisma/seed.js';
import { getUserBackend } from './getUser.js';
import { authenticateUser } from "./tokens.js";

function getRandomNumber(playerIds) {
	const randomIndex = Math.floor(Math.random() * playerIds.length);
	const randomNumber = playerIds[randomIndex];
	playerIds.splice(randomIndex, 1);
	return randomNumber;
}

export const createTournament = async (req, reply) => {

	let playerIds = [];
	var playersInfos = new Map();

	const userLogIn = await getUserBackend(req, reply);
	for (let i = 1; i < req.body.playerData.length; ++i) {
		if (req.body.playerData[i].trim() === '' || req.body.playerData[i].trim() === userLogIn)
			return;
	}

	const uniquePlayers = new Set(req.body.playerData.map(name => name.trim()));
	if (uniquePlayers.size !== req.body.playerData.length)
		return;

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


async function createBrackets(players, tournamentId) {
	const tournament = await getTournamentById(tournamentId);
	const remainingPlayers = players.filter(player => player.NbVictory === tournament.currentRound - 1);
	const sortedPlayers = remainingPlayers.sort((a, b) => a.playerNumber - b.playerNumber);
	const nextMatch = []

	for (let i = 0; i < sortedPlayers.length; ++i) {
		const alreadyLose = await hasAlreadyLose(sortedPlayers[i].name, tournamentId);
		if (alreadyLose === false) {
			nextMatch.push(sortedPlayers[i].name);
			nextMatch.push(sortedPlayers[i + 1].name);
			break;
		}
	}
	return nextMatch;
}

export async function nextMatchTournament(req, reply) {
	try {
		const id = await getMaxId("tournament");
		const players = await findUsersTournament(id);
		const nextMatch = await createBrackets(players, id)
		reply.send(nextMatch);
	} catch (error) {
		return reply.send({message: error.message});
	}
}

export async function updateResultTournamentGame(req, reply) {
	try {
		let user, winnerId, loserId;
		const response = await authenticateUser(req);
		if (response.status === 200)
			user = await findUserById(response.user.id);
		if (!user)
			return;
		const winner = req.body.winner.trim();
		const loser = req.body.loser.trim();
		const winnerScore = req.body.winnerScore;
		const loserScore = req.body.loserScore;
		if (user.username === winner) {
			winnerId = user.id;
			loserId = 0;
		} else if (user.username === loser) {
			winnerId = 0;
			loserId = user.id;
		} else {
			winnerId = 0;
			loserId = 0;
		}
		const id = await getMaxId("tournament");
		await fillTournamentDb(id, winner, loser, winnerScore, loserScore, winnerId, loserId);
	} catch (error) {
		return reply.send({message: error.message});
	}
}

export async function getWinnerTournament(req, reply) {
	try {
		let winnerObject = {}
		const id = await getMaxId("tournament");
		const tournament = await getTournamentById(id);
		const players = await findUsersTournament(id);
		const winner = players.filter(player => player.NbVictory === tournament.nbRounds);
		if (winner.length === 0) {
			winnerObject["winner"] = false;
			return reply.send(winnerObject);
		}
		winnerObject["winner"] = winner;
		reply.send(winnerObject);
	} catch (error) {
		return reply.send({message: error.message});
	}
}