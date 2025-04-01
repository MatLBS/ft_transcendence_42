import { findUser } from '../dist/prisma/seed.js';
import { app } from '../server.js';

export const loginUser = async (req, reply) => {
	try {
		const user = await findUser(req.body.username);

		const validPassword = await app.bcrypt.compare(req.body.password, user.password);

		if (!validPassword)
			throw new Error(`Invalid password for user '${user.username}'`);
		
	} catch (error) {
		return reply.send({message: error.message});
	}
	return reply.send({message : "ok"});
};