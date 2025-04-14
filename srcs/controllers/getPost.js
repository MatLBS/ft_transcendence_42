import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { routes } from "../router.js";
import { __dirname } from "../router.js";
import { authenticateUser } from "./tokens.js";
import { findUserById } from "../dist/prisma/seed.js";

// Fonction pour charger une page d'erreur
const getErrorPage = (reply, response, errorCode) => {
	const isConnected = response.status === 200;
	const css = path.join(__dirname, 'public', `error_page/style/${errorCode}.css`);
	const content = fs.readFileSync(path.join(__dirname, 'public', `error_page/${errorCode}.html`), 'utf8');
	if (response.status === 200 && response.newAccessToken) {
		return reply
			.setCookie('access_token', response.newAccessToken, {
				httpOnly: true,
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
	const file = req.body.url.split("/").pop() || "home";
	let content = "", css = "", js = "", user = null, isConnected = false;

	try {
		// Authentification de l'utilisateur
		const response = await authenticateUser(req);
		if (response.status !== 200) {
			if (needLogin(file)) return getErrorPage(reply, response, 403);
		} else {
			isConnected = true;
			if (dontNeedLogin(file)) return getErrorPage(reply, response, 403);
			user = await findUserById(response.user.id);
			if (!user) return getErrorPage(reply, response, 403);
			user.google = response.user.google;
		}

		// Recherche de la route correspondante
		const route = routes[file];
		if (route) {
			if (route.useEjs) {
				content = await ejs.renderFile(path.join(route.dir, route.file), { user });
			} else {
				content = fs.readFileSync(path.join(route.dir, route.file), 'utf8');
			}
			css = route.css;
			js = route.js;
		} else {
			return getErrorPage(reply, response, 404);
		}

		// Envoi de la réponse
		if (response.status === 200 && response.newAccessToken) {
			return reply
				.setCookie('access_token', response.newAccessToken, {
					httpOnly: true,
					secure: false,
					sameSite: 'Strict'
				})
				.send({ content, css, js, isConnected });
		} else {
			return reply.send({ content, css, js, isConnected });
		}
	} catch (error) {
		console.error("Error in getPost:", error);
		return getErrorPage(reply, response, 500);
	}
};
