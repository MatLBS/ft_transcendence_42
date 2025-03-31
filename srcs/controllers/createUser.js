import { app } from '../server.js';

export const createUser = async (req, reply) => {
	try {
		// await validatePassword(req.body.password)
		const hashedPassword = await app.bcrypt.hash(req.body.password, 10);
		await createUser(req.body.username, hashedPassword, req.body.email);
		reply.redirect('/home')
	}
	catch {
		console.log("error");
		reply.redirect('/register')
	}
};
