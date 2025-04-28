import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { routes } from "../router.js";
import { __dirname } from "../router.js";
import { authenticateUser } from "./tokens.js";
import { findUserById } from "../dist/prisma/seed.js";
import { json } from 'stream/consumers';
import { getUserProfile } from './getUserProfile.js';
import { getFollowedUsers } from '../dist/prisma/friends.js';

// Fonction pour charger une page d'erreur
const errorPage = async (req, reply, response, errorCode) => {
	const isConnected = response.status === 200;
	const css = path.join(__dirname, 'views', `error_page/style/${errorCode}.css`);
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

// Vérifie si une page nécessite une connexion
const needLogin = (file) => ["admin", "profil", "game", "update"].includes(file);

// Vérifie si une page nécessite que le user ne soit pas connecté
const dontNeedLogin = (file) => ["login", "register"].includes(file);

export const getPost = async (req, reply) => {
	let file = req.body.url.split("/");
	if (file[1] === "users") {
		return getUserProfile(req, reply, file[2]);
	}
	file = file.pop() || "home";
	const jsonLanguage = req.body.jsonLanguage;

	let content = "", css = "", js = "", user = null, isConnected = false, response = "", friends = null;

	try {
		// Authentification de l'utilisateur
		const response = await authenticateUser(req);
		if (response.status !== 200) {
			if (needLogin(file)) return await errorPage(req, reply, response, 403);
		} else {
			isConnected = true;
			if (dontNeedLogin(file)) return await errorPage(req, reply, response, 403);
			user = await findUserById(response.user.id);
			if (!user) return await errorPage(req, reply, response, 403);
			user.google = response.user.google;
			friends = await getFollowedUsers(user.id);
		}

		// Recherche de la route correspondante
		const route = routes[file];
		if (route) {
			content = await ejs.renderFile(path.join(route.dir, route.file), { user, jsonLanguage, friends });
			css = route.css;
			js = route.js;
		} else {
			return await errorPage(req, reply, response, 404);
		}

		// Envoi de la réponse
		if (response.status === 200 && response.newAccessToken) {
			return reply
				.setCookie('access_token', response.newAccessToken, {
					httpOnly: false,
					secure: false,
					sameSite: 'Strict'
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
