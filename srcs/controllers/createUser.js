import { create } from 'domain';
import { app } from '../server.js';
import { createUser } from '../dist/prisma/seed.js';

export const checkUserBack = async (req, reply) => {
	const password = req.body.password;
	const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[#?!@$%^&*-]).{8,}$/;
	if (!passwordRegex.test(password)) {
		return reply.send({message : "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character."});
	}
	// verif email

	const hashedPassword = await app.bcrypt.hash(password);

	try {
		const result = await createUser(req.body.username, hashedPassword, req.body.email);
	} catch (error) {
		return reply.send({message: error.message});
	}
	return reply.send({message : "ok"});
};
