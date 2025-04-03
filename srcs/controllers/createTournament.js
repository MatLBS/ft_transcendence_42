import { createTournamentDb } from '../dist/prisma/seed.js';
import { findUsersTournament } from '../dist/prisma/seed.js';

function getRandomNumber(playerIds) {
	const randomIndex = Math.floor(Math.random() * playerIds.length);
	const randomNumber = playerIds[randomIndex];
	playerIds.splice(randomIndex, 1);
	return randomNumber;
}

function createBrackets(players) {

	let rounds
	switch(players.length) {
		case 4: 
			rounds = 2
			break
		case 8:
			rounds = 3
			break
		default:
			rounds = 4
	}

	let j = 0

	for (; j < rounds; ++j) {

		const remainingPlayers = players.filter(player => player.NbVictory >= j);

		const sortedPlayers = remainingPlayers.sort((a, b) => a.playerNumber - b.playerNumber);

		for (let i = 0; i < sortedPlayers.length; i++) {
			let player = sortedPlayers[i]
			let opponent = sortedPlayers[i + 1]

			i++
			if (i % 2 !== 0)
				players[i].NbVictory++
		}
	}
	
	const remainingPlayers = players.filter(player => player.NbVictory >= j);
	console.log("The winner is " + remainingPlayers[0].name)

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

	try {
		
		const tournamentId = await createTournamentDb(playersInfos)
		
		const players = await findUsersTournament(tournamentId)
		
		createBrackets(players)
	} catch (error) {
		return reply.send({message: error.message});
	}

	//Si tout c'est bien passé, il faut maintenant créer les brackets et envoyer la data à jb

	// Comme les joueurs ont un nombre aléatoire, je fais d'abord jouer 1 contre 2, puis 3 contre 4 ...
	// Au tour suivant, je fais jouer le gagnant de 1 vs 2 contre le gagnant de 3 vs 4, donc si c'est 1 le premier gagnant, je le fais
	// jouer contre le nombre le plus proche d'après, 3 ou 4

	//Je vais ensuite boucler le nombre de rounds nécessaires (rounds = NBparticipants) / 2) et à la fin, le gagnant est le joueur avec le plus de victories

};