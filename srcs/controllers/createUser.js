import { app } from '../server.js';
import { createUser } from '../dist/prisma/seed.js';
import { loginUser } from './loginUser.js';

export const checkUserBack = async (req, reply) => {
	const password = req.body.password;
	const email = req.body.email;
	const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[#?!@$%^&*-]).{8,}$/;
	const emailRegex = /[a-zA-Z0-9_.±]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;


	if (!passwordRegex.test(password))
		return reply.send({message : "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character."});

	if (!emailRegex.test(email) && error_input)
		return reply.send({message : "The email is not valide."});

	const hashedPassword = await app.bcrypt.hash(password);

	try {
		const result = await createUser(req.body.username, hashedPassword, req.body.email);
	} catch (error) {
		return reply.send({message: error.message});
	}
	return loginUser(req, reply);
};
