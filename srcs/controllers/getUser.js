import { authenticateUser } from "./tokens.js";


export const getUser = async (req , reply) => {
	const response = await authenticateUser(req);
	console.log ("response 2 =", response.user.username);
	reply.send({ user: { username: response.user.username } }); 
}
