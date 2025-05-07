import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

export async function createUser (username: string, password: string, email: string, profilePicture?: string, bgPicture?: string) {
	const usernameAlreadyExist = await prisma.user.findFirst({
		where: {
			username: username,
		},
	})

	const emailAlreadyExist = await prisma.user.findFirst({
		where: {
			email: email,
		},
	})

	if (usernameAlreadyExist)
		throw new Error(`The username \"${username}\" already exists`);
	if (emailAlreadyExist)
		throw new Error(`The email \"${email}\" already exists for a user`);

	await prisma.user.create({
		data: {
			username: username,
			password: password,
			email: email,
			profilePicture: profilePicture || null,
			bgPicture: bgPicture || null,
			isOnline: false,
		},
	})
}

export async function createUserGoogle (username: string, email: string, profilePicture: string, bgPicture?: string) {
	let usernameAlreadyExist: any;
	let i: number = 0;
	while (true) {
		usernameAlreadyExist = await prisma.user.findFirst({
			where: {
				username: username,
			},
		})
		if (!usernameAlreadyExist)
			break;
		username += i;
		i++;
	}

	const emailAlreadyExist = await prisma.user.findFirst({
		where: {
			email: email,
		},
	})

	if (emailAlreadyExist)
		return;

	await prisma.user.create({
		data: {
			username: username,
			email: email,
			profilePicture: profilePicture,
			bgPicture: bgPicture || null,
			isOnline: false,
		},
	})
	return;
}

export async function updateUserDb (id: number, username: string, password: string, email: string, profilePicture?: string, bgPicture?: string) {
	const usernameAlreadyExist = await prisma.user.findFirst({
		where: {
			username: username,
			NOT: {
				id: id,
			},
		},
	})

	const emailAlreadyExist = await prisma.user.findFirst({
		where: {
			email: email,
			NOT: {
				id: id,
			},
		},
	})

	if (usernameAlreadyExist)
		throw new Error(`The username \"${username}\" already exists`);
	if (emailAlreadyExist)
		throw new Error(`The email \"${email}\" already exists for a user`);

	const updateUser: { username: string, password?: string, email: string, profilePicture?: string, bgPicture?: string } = {
		username: username,
		email: email,
	};
	if (password)
		updateUser.password = password;
	if (profilePicture)
		updateUser.profilePicture = profilePicture;
	if (bgPicture)
		updateUser.bgPicture = bgPicture;
	const user = await prisma.user.update({
		where: {
			id: id,
		},
		data: updateUser,
	})
	if (!user)
		throw new Error(`User do not exits in the database.`)
}

export async function updateUserGoogleDb (id: number, username: string, profilePicture?: string, bgPicture?: string) {
	const usernameAlreadyExist = await prisma.user.findFirst({
		where: {
			username: username,
			NOT: {
				id: id,
			},
		},
	})

	if (usernameAlreadyExist)
		throw new Error(`The username \"${username}\" already exists`);

	const updateUser: { username: string, profilePicture?: string, bgPicture?: string} = {
		username: username,
	};
	if (profilePicture)
		updateUser.profilePicture = profilePicture;
	if (bgPicture)
		updateUser.bgPicture = bgPicture;
	const user = await prisma.user.update({
		where: {
			id: id,
		},
		data: updateUser,
	})
	if (!user)
		throw new Error(`User do not exits in the database.`)
}

export async function deleteAllUsers () {
	await prisma.user.deleteMany()
}

export async function deleteUser (username: string) {
	const user = await prisma.user.findFirst({
		where: {
			username: username,
		},
		select: {
			id: true,
		},
	})

	if (!user)
		throw new Error(`User with name ${username} not found`)

	const deletedUser = await prisma.user.delete({
		where: {
			id: user.id,
		},
	})
}

export async function getAllUsers() {
	const users = await prisma.user.findMany();
	return users;
}

export async function searchUsername(username: string) {
	const users = await prisma.user.findMany({
		where: {
			username: {
				contains: username,
			},
		},
	});
	return users;
}

export async function isUserExist(username: string) {
	const user = await prisma.user.findFirst({
		where: {
			username: username,
		},
	});
	if (!user)
		throw new Error(`Username '${username}' do not exits in the database.`)
	return user;
}

export async function findUser(username: string) {
	const user = await prisma.user.findFirst({
		where: {
			username: username,
		},
	});
	return user;
}

export async function findUserById(id: number) {
	const user = await prisma.user.findFirst({
		where: {
			id: id,
		},
	});
	return user;
}

export async function findUserByEmail(email: string) {
	const user = await prisma.user.findFirst({
		where: {
			email: email,
		},
	});
	return user;
}

export async function findUsersTournament(tournamentId: number) {
	const players = await prisma.tournamentPlayers.findMany({
		where: {
			tournamentId: tournamentId,
		},
	});
	if (!players)
		throw new Error(`No player were found for tournament with id '${tournamentId}'.`)
	return players;
}

export async function createTournamentDb(playersData: Map<string, { name: string; NbVictory: number; playerNumber: number }>, nbRounds: number) {

	const tournament = await prisma.tournament.create({
		data: {
			nbRounds: nbRounds,
			currentRound: 1,
			nbMatchesPlayed: 0,
			nbMatchesPlayedRound: 0,
		}
	})

	if (!tournament)
		throw new Error(`Failed to create a new tournament.`)


	for (const [key, value] of playersData) {
		const player = await prisma.tournamentPlayers.create({
			data: {
				name: value.name,
				NbVictory: value.NbVictory,
				playerNumber: value.playerNumber,
				tournamentId: tournament.id,
			},
		});
		if (!player)
			throw new Error(`Failed to create a new player for the tournament.`)
	}

	return (tournament.id)
}

export async function createLocalDb(players: Array<string>) {

	const localParty = await prisma.local.create({
		data: {}
	})

	if (!localParty)
		throw new Error(`Failed to create a new local party.`)

	for (let player of players) {
		const playerDb = await prisma.localPlayers.create({
			data: {
				localId: localParty.id,
				username: player
			}
		})
		if (!playerDb)
			throw new Error(`Failed to create a player for local party.`)
	}
}

export async function fillLocalDb(id: number, winner: string, loser: string, winnerScore: number, loserScore: number, winnerId: number, loserId: number) {
	const localParty = await prisma.local.update({
		where: { id: id },
		data:{
			winner: winner,
			loser: loser,
			winnerScore: winnerScore,
			loserScore: loserScore,
			winnerId: winnerId,
			loserId: loserId
		}
	});
	return localParty;
}

export async function updateUserLanguageDB(id: number, newLanguage: string) {
	const userToUpdate = await prisma.user.update({
		where: { id: id },
		data: { language: newLanguage }
	})
}

export async function getMaxId(model: string) {
	switch (model) {
		case 'local':
			const latestLocal = await prisma.local.findFirst({
				orderBy: {
					id: 'desc'
				},
				take: 1
			});
			if (!latestLocal)
				throw new Error(`No local party were found in the database.`)
			return latestLocal.id;
		case 'tournament':
			const latestTournament = await prisma.tournament.findFirst({
				orderBy: {
					id: 'desc'
				},
				take: 1
			});
			if (!latestTournament)
				throw new Error(`No local party were found in the database.`)
			return latestTournament.id;
		case 'solo':
			const latestSolo = await prisma.solo.findFirst({
				orderBy: {
					id: 'desc'
				},
				take: 1
			});
			if (!latestSolo)
				throw new Error(`No local party were found in the database.`)
			return latestSolo.id;
	}
}

export async function createSoloDb() {
	const soloParty = await prisma.solo.create({
		data: {}
	})
	if (!soloParty)
		throw new Error(`Failed to create a new local party.`)
}

export async function fillSoloDb(id: number, winner: string, loser: string, winnerScore: number, loserScore: number, winnerId: number, loserId: number) {
	const soloParty = await prisma.solo.update({
		where: { id: id },
		data:{
			winner: winner,
			loser: loser,
			winnerScore: winnerScore,
			loserScore: loserScore,
			winnerId: winnerId,
			loserId: loserId
		}
	});
	return soloParty;
}

export async function fillTournamentDb(id: number, winner: string, loser: string, winnerScore: number, loserScore: number, winnerId: number, loserId: number) {
	const winnerPlayer = await prisma.tournamentPlayers.findFirst({
		where: {
			tournamentId: id,
			name: winner
		}
	});

	if (!winnerPlayer)
		throw new Error(`Winner player not found in tournament with id '${id}'.`);

	await prisma.tournamentPlayers.update({
		where: { id: winnerPlayer.id },
		data: { NbVictory: { increment: 1 }}
	});
	await prisma.tournament.update({
		where: { id: id },
		data: {
			nbMatchesPlayed: { increment: 1 },
			nbMatchesPlayedRound: { increment: 1 }
		}
	})
	const matchTournament = await prisma.tournamentMatches.create({
		data: {
			tournamentId: id,
			winner: winner,
			loser: loser,
			winnerScore: winnerScore,
			loserScore: loserScore,
			winnerId: winnerId,
			loserId: loserId
		}
	})
	const tournament = await getTournamentById(id);
	if (!tournament || !tournament.nbRounds || !tournament.currentRound || !tournament.nbMatchesPlayed)
		throw new Error(`Tournament with id '${id}' do not exits in the database.`)

	const totalMatchesRound = Math.pow(2, tournament.nbRounds - tournament.currentRound);
	if (tournament.nbMatchesPlayedRound === totalMatchesRound)
		await prisma.tournament.update({
			where: { id: id },
			data: {
				currentRound: { increment: 1 },
				nbMatchesPlayedRound: 0,
			}
		});
	return matchTournament;
}

export async function getTournamentById(id: number) {
	const tournament = await prisma.tournament.findFirst({
		where: {
			id: id,
		},
	})
	if (!tournament)
		throw new Error(`Tournament with id '${id}' do not exits in the database.`)
	return tournament;
}

export async function logUser(id: number, isOnline: boolean) {
	const user = await prisma.user.update({
		where: {
			id: id,
		},
		data: {isOnline: isOnline}
	})
}

export async function getLocalMatches(userId: number) {
	const localMatches = await prisma.local.findMany({
		where: {
			OR: [
				{
					winnerId: userId,
				},
				{
					loserId: userId,
				},
			],
		},
	});
	if (!localMatches)
		throw new Error(`No local matches were found in the database.`)
	return localMatches;
}

export async function getSoloMatches(userId: number) {
	const soloMatches = await prisma.solo.findMany({
		where: {
			OR: [
				{
					winnerId: userId,
				},
				{
					loserId: userId,
				},
			],
		},
	});
	if (!soloMatches)
		throw new Error(`No local matches were found in the database.`)
	return soloMatches;
}

export async function getTournamentMatches(userId: number) {
	const tournamentMatches = await prisma.tournamentMatches.findMany({
		where: {
			OR: [
				{
					winnerId: userId,
				},
				{
					loserId: userId,
				},
			],
		},
	});
	if (!tournamentMatches)
		throw new Error(`No local matches were found in the database.`)
	return tournamentMatches;
}

export async function hasAlreadyLose(playerName: string, tournamentId: number) {
	const matches = await prisma.tournamentMatches.findFirst({
		where: {
			AND: [
				{
					tournamentId: tournamentId,
				},
				{
					loser: playerName,
				},

			]

		}
	})
	if (matches)
		return true;
	return false;
}

export async function getAllMessagesDb(userLogInId: number, targetName: string) {
	const user = await findUserById(userLogInId);
    let target = await findUser(targetName)
	const conversation = await prisma.conversation.findFirst ({
		where: {
			OR: [
				{
					user1Id: user!.id,
					user2Id: target!.id,
				},
				{
					user1Id: target!.id,
					user2Id: user!.id,
				}
			]
		}
	})
	if (!conversation)
		return (null)
	const messages = await prisma.message.findMany ({
		where: {
			conversationId: conversation!.id,
		}
	})
	return (messages);
}

export async function enterNewMessageDb(newMessage: string, userLogInId: number, targetName: string) {
	const user = await findUserById(userLogInId);
    let target = await findUser(targetName)
	let conversation = await prisma.conversation.findFirst({
		where: {
			OR: [
				{
					user1Id: user!.id,
					user2Id: target!.id,
				},
				{
					user1Id: target!.id,
					user2Id: user!.id,
				}
			]
		}
	  });
	if (!conversation) {
		conversation = await prisma.conversation.create({
			data: {
				user1Id: user!.id,
				user2Id: target!.id
			}
		})
	}
	if (!conversation)
		throw new Error(`Could not create conversation.`);		
	const messages = await prisma.message.create ({
		data: {
			content: newMessage,
			senderId: user!.id,
			conversationId: conversation!.id,
		}
	})
}