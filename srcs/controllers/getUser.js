import { authenticateUser } from "./tokens.js";

export const getUser = async (req , reply) => {
	const response = await authenticateUser(req);
	reply.send({ user: { username: response.user.username } }); 
}
