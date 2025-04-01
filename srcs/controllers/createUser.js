import { create } from 'domain';
import { app } from '../server.js';
import { createUser } from '../dist/prisma/seed.js';

export const checkUserBack = async (req, reply) => {
	const password = req.body.password;
	const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[#?!@$%^&*-]).{8,}$/;
	if (!passwordRegex.test(password)) {
		return reply.send({message : "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character."});
	}


	console.log("password is ok")
	// const hashedPassword = await app.bcrypt.hash(password);

	// console.log(hashedPassword)

	createUser(req.body.username, password, req.body.email);

	console.log("ici1")
	console.log(result);
	// if (result === "1") {
	// 	return reply.send({message : "An user with those informations already exists in the database."});
	// }
	console.log("ici2")
	return reply.send({message : ""});
};