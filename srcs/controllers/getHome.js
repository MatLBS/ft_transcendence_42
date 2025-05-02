import { authenticateUser } from "./tokens.js";
import { json } from "stream/consumers";

export const getHome = async (req, reply) => {
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

export const handleFavicon = async (req, reply) => {
	return;
}
