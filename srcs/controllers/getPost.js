import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { routes } from "../router.js";
import { __dirname } from "../router.js";
import { authenticateUser } from "./tokens.js";
import { findUser } from "../dist/prisma/seed.js";

// Fonction pour charger une page d'erreur
const getErrorPage = (reply, errorCode) => {
	const css = path.join(__dirname, 'public', `error_page/style/${errorCode}.css`);
	const content = fs.readFileSync(path.join(__dirname, 'public', `error_page/${errorCode}.html`), 'utf8');
	return reply.code(errorCode).send({ content, css });
};

// Vérifie si une page nécessite une connexion
const needLogin = (file) => ["admin", "profil", "game"].includes(file);

// Vérifie si une page nécessite que le user ne soit pas connecté
const dontNeedLogin = (file) => ["login", "register"].includes(file);

export const getPost = async (req, reply) => {
	const file = req.body.url.split("/").pop() || "home";
	let content = "", css = "", js = "", user = null;

	try {
		// Authentification de l'utilisateur
		const response = await authenticateUser(req);
		if (!response.user) {
			if (needLogin(file)) return getErrorPage(reply, response.status);
		} else {
			if (dontNeedLogin(file)) return getErrorPage(reply, 403);
			user = await findUser(response.user.username);
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
			return getErrorPage(reply, 404);
		}

		// Envoi de la réponse
		return reply.send({ content, css, js });
	} catch (error) {
		console.error("Error in getPost:", error);
		return getErrorPage(reply, 500);
	}
};
