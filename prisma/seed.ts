import { PrismaClient } from '@prisma/client'
// import { app } from '../srcs/server.js';

const prisma = new PrismaClient()

export async function createUser (username: string, password: string, email: string, profilePicture?: string) {
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
		},
	})
}

export async function createUserGoogle (username: string, email: string, profilePicture: string) {
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
		},
	})
	return;
}

export async function updateUserDb (id: number, username: string, password: string, email: string, profilePicture?: string) {
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

	const updateUser: { username: string, password?: string, email: string, profilePicture?: string } = {
		username: username,
		email: email,
	};
	if (password)
		updateUser.password = password;
	if (profilePicture)
		updateUser.profilePicture = profilePicture;
	const user = await prisma.user.update({
		where: {
			id: id,
		},
		data: updateUser,
	})
	if (!user)
		throw new Error(`User do not exits in the database.`)
}

export async function updateUserGoogleDb (id: number, username: string, profilePicture?: string) {
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

	const updateUser: { username: string, profilePicture?: string } = {
		username: username,
	};
	if (profilePicture)
		updateUser.profilePicture = profilePicture;
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

	if (!user) {
		console.log("error")
		throw new Error(`User with name ${username} not found`)
	}

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

export async function findUser(username: string) {
	const user = await prisma.user.findFirst({
		where: {
			username: username,
		},
	});
	if (!user)
		throw new Error(`Username '${username}' do not exits in the database.`)
	return user;
}

export async function findUserById(id: number) {
	const user = await prisma.user.findFirst({
		where: {
			id: id,
		},
	});
	if (!user)
		throw new Error(`User with id '${id}' do not exits in the database.`)
	return user;
}

export async function findUserByEmail(email: string) {
	const user = await prisma.user.findFirst({
		where: {
			email: email,
		},
	});
	if (!user)
		throw new Error(`Email '${email}' do not exits in the database.`)
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

export async function createTournamentDb(playersData: Map<string, { name: string; NbVictory: number; rank: number; playerNumber: number }>) {

	const tournament = await prisma.tournament.create({
		data: {}
	})

	if (!tournament)
		throw new Error(`Failed to create a new tournament.`)


	for (const [key, value] of playersData) {
		const player = await prisma.tournamentPlayers.create({
			data: {
				name: value.name,
				NbVictory: value.NbVictory,
				rank: value.rank,
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
