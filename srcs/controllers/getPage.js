import { authenticateUser } from "./tokens.js";

// pour gerer les url directe
export const getPage = async (req, reply) => {
	const response = await authenticateUser(req);
	if (response.status === 200 && response.newAccessToken) {
		return reply
			.setCookie('access_token', response.newAccessToken, {
				httpOnly: false,
				secure: false,
				sameSite: 'Strict'
			})
			.view("index.ejs");
	} else {
		return reply.view("index.ejs");
	}
}
