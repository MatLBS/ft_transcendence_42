import { authenticateUser } from "./tokens.js";

// pour gerer les url directes
export const getPage = async (req, reply) => {
	if (req.params.page.endsWith('.js') || req.params.page.endsWith('.css'))
		return reply.sendFile(req.params.page);
	const response = await authenticateUser(req);
	return reply.view("index.ejs", { response });
}
