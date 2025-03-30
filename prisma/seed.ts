import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function createUser (username: string, password: string, email: string) {
	const userAlreadyExist = await prisma.user.findFirst({
		where: {
			OR: [
				{ email: email},
				{ username: username},
			  ],
		},
	})

	if (userAlreadyExist) {
		throw new Error(`The email ${email} already exists for a user`)
	}

	await prisma.user.create({
		data: {
			username: username,
			password: password,
			email: email,
		},
	})
}

export async function deleteAllUsers () {
	await prisma.user.deleteMany()
}

export async function deleteUser (username: string) {
	console.log(username)
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

