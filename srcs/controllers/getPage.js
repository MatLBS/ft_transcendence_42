import { authenticateUser } from "./tokens.js";

// pour gerer les url directe
export const getPage = async (req, reply) => {
	if (req.params.page.endsWith('.js') || req.params.page.endsWith('.css'))
		return reply.sendFile(req.params.page);
	const response = await authenticateUser(req);
	if (response.status === 200 && response.newAccessToken) {
		return reply
			.setCookie('access_token', response.newAccessToken, {
				httpOnly: true,
				secure: false,
				sameSite: 'Strict'
			})
			.view("index.ejs");
	} else {
		return reply.view("index.ejs");
	}
}
