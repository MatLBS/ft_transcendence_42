import ejs from 'ejs';
import { __dirname, routes } from "../router.js";
import path from 'path';
import { getLanguageWithoutBody } from "./getLanguage.js"
import { authenticateUser } from "../controllers/tokens.js";
import { findUserById } from "../dist/prisma/seed.js";

export const addErrorContent = async (contentAdd) => {
	const content = await ejs.renderFile(path.join(__dirname, 'views', '/index.ejs'));
	let updatedContent = content.replace('app">', `app">${contentAdd}`);
	updatedContent = updatedContent.replace('</head>', `<link id="css" rel="stylesheet" href="/public/style/error_page/error.css">\n</head>`);
	return updatedContent;
}

// Fonction pour charger une page d'erreur si url dirrecte
export const getErrorPageDirect = async (req, reply) => {
	let jsonLanguage = await getLanguageWithoutBody(req.cookies.userLanguage);
	let response = await authenticateUser(req);
	let isConnected = false, user = null;
	if (response.status === 200 && (user = await findUserById(response.user.id)))
		isConnected = true;

	const contentAdd = await ejs.renderFile(path.join(__dirname, 'views/error_page/404.ejs'), { jsonLanguage, isConnected });
	const content = await addErrorContent(contentAdd);
	return reply
		.code(200)
		.type('text/html')
		.header('Content-Type', 'text/html; charset=utf-8')
		.send(content);
};

// Fonction pour charger une page d'erreur dans recvcontent
export const errorPage = async (req, reply, response, errorCode) => {
	let isConnected = false, user = null;
	if (response.status === 200 && (user = await findUserById(response.user.id)))
		isConnected = true;
	const css = path.join('/public', `style/error_page/error.css`);
	const jsonLanguage = req.body.jsonLanguage;
	const content = await ejs.renderFile(path.join(__dirname, 'views', `error_page/${errorCode}.ejs`), { jsonLanguage, isConnected });
	if (response.status === 200 && response.newAccessToken) {
		return reply
			.setCookie('access_token', response.newAccessToken, {
				httpOnly: false,
				secure: false,
				sameSite: 'Strict',
				path: "/",
			})
			.code(errorCode).send({ content, css, isConnected });
	} else {
		return reply.code(errorCode).send({ content, css, isConnected });
	}
};
