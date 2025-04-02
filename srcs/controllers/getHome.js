import { authenticateUser } from "./tokens.js";

export const getHome = async (req, reply) => {
	const response = await authenticateUser(req);
	return reply.view("index.ejs", { response });
}
