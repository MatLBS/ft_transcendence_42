import path from 'path';
import ejs from 'ejs';
import { getLanguageWithoutBody } from "./getLanguage.js"
import { routes } from "../router.js";
import { __dirname } from "../router.js";
import { authenticateUser } from "./tokens.js";
import { findUserById } from "../dist/prisma/seed.js";
import { json } from 'stream/consumers';
import { getUserProfile } from './getUserProfile.js';
import { getFollowedUsers } from '../dist/prisma/friends.js';
import { errorPage } from './errorPage.js';

// Vérifie si une page nécessite une connexion
export const needLogin = (file) => ["profil", "game", "update"].includes(file);

// Vérifie si une page nécessite que le user ne soit pas connecté
export const dontNeedLogin = (file) => ["login", "register"].includes(file);

const redirectToLogin = async (req, reply) => {
	const jsonLanguage = req.body.jsonLanguage;
	const css = routes.login.css;
	const js = routes.login.js;
	const content = await ejs.renderFile(path.join(__dirname, 'views', '/login.ejs'), { jsonLanguage, isConnected: false });
	return reply.send({ content, css, js, isConnected: false });
}

const redirectToHome = async (req, reply) => {
	const jsonLanguage = req.body.jsonLanguage;
	const css = routes.home.css;
	const js = routes.home.js;
	const content = await ejs.renderFile(path.join(__dirname, 'views', '/home.ejs'), { jsonLanguage, isConnected: true });
	return reply.send({ content, css, js, isConnected: true });
}

export const getPost = async (req, reply) => {
	let file = req.body.url.split("/");
	if (file[1] === "users")
		return getUserProfile(req, reply, file[2]);
	file = file.pop() || "home";
	const jsonLanguage = await getLanguageWithoutBody(req.cookies.userLanguage);

	let content = "", css = "", js = "", user = null, isConnected = false, response = "", friends = null;

	try {
		// Authentification de l'utilisateur
		response = await authenticateUser(req);
		if (response.status === 200 && (user = await findUserById(response.user.id))) {
			isConnected = true;
			if (dontNeedLogin(file))
				return await redirectToHome(req, reply);
			user.google = response.user.google;
			friends = await getFollowedUsers(user.id);
		} else {
			if (needLogin(file)) {
				return await redirectToLogin(req, reply);
			}
		}

		// Recherche de la route correspondante
		const route = routes[file];
		if (route) {
			content = await ejs.renderFile(path.join(route.dir, route.file), { user, jsonLanguage, friends, isConnected});
			css = route.css;
			js = route.js;
		} else {
			return await errorPage(req, reply, response, 404);
		}

		// Envoi de la réponse
		if (response.status === 200 && response.newAccessToken) {
			return reply
				.setCookie('access_token', response.newAccessToken, {
					httpOnly: true,
					secure: true,
					sameSite: 'Strict',
					path: "/",
				})
				.send({ content, css, js, isConnected });
		} else {
			return reply.send({ content, css, js, isConnected });
		}
	} catch (error) {
		console.error("Error in getPost:", error);
		return await errorPage(req, reply, response, 500);
	}
};
