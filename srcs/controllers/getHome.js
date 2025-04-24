import { authenticateUser } from "./tokens.js";
import { getLanguageWithoutBody } from "./getLanguage.js"
import { json } from "stream/consumers";

export const getHome = async (req, reply) => {
	let clientLanguage = req.cookies.userLanguage;
	if (!clientLanguage)
		clientLanguage = "en"
	const jsonLanguage = await getLanguageWithoutBody(clientLanguage);
	const response = await authenticateUser(req);
	if (response.status === 200 && response.newAccessToken) {
		return reply
			.setCookie('access_token', response.newAccessToken, {
				httpOnly: false,
				secure: false,
				sameSite: 'Strict'
			})
			.view("index.ejs", {jsonLanguage});
	} else {
		return reply.view("index.ejs", {jsonLanguage});
	}
}
