import { authenticateUser } from "./tokens.js";

export const getHome = async (req, reply) => {
	const response = await authenticateUser(req);
	if (response.status === 200 && response.newAccessToken) {
		return reply
			.setCookie('access_token', response.newAccessToken, {
				httpOnly: true,
				secure: false,
				sameSite: 'Strict'
			})
			.view("index.ejs", { response });
	} else {
		return reply.view("index.ejs", { response });
	}
}
