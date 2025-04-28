import ejs from 'ejs';
import { __dirname } from "../router.js";
import path from 'path';

export const getErrorPage = (req, reply) => {
	console.log("error page");
	return reply.redirect("/404");
};

// Fonction pour charger une page d'erreur
export const errorPage = async (req, reply, response, errorCode) => {
	const isConnected = response.status === 200;
	const css = path.join('public', `style/error_page/error.css`);
	const jsonLanguage = req.body.jsonLanguage;
	const content = await ejs.renderFile(path.join(__dirname, 'views', `error_page/${errorCode}.ejs`), { jsonLanguage });
	if (response.status === 200 && response.newAccessToken) {
		return reply
			.setCookie('access_token', response.newAccessToken, {
				httpOnly: false,
				secure: false,
				sameSite: 'Strict'
			})
			.code(errorCode).send({ content, css, isConnected });
	} else {
		return reply.code(errorCode).send({ content, css, isConnected });
	}
};
