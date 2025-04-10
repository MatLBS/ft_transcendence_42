import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import fastifyStatic from '@fastify/static';
import fastifyView from '@fastify/view';
import fastifyFormbody from '@fastify/formbody';
import { checkUserBack } from './controllers/createUser.js';
import { login } from './controllers/loginUser.js';
import { getPost } from './controllers/getPost.js';
import { getLanguage } from './controllers/getLanguage.js';
import { getHome } from './controllers/getHome.js';
import { getPage } from './controllers/getPage.js';
import { logout } from './controllers/logout.js';
import { refresh } from './controllers/tokens.js';
import { tournament } from './controllers/tournament.js';
import { createTournament } from './controllers/createTournament.js';
import { local } from './controllers/local.js';
import { createLocal } from './controllers/createLocal.js';
import { updateUser } from './controllers/updateUser.js';

// peut etre sauvegarder le content des fichier html.

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadRoutesFromDirectory(directory, useEjs) {
	const routes = {};
	const files = fs.readdirSync(directory);

	files.forEach(file => {
		if (path.extname(file) === ".html" || path.extname(file) === ".ejs") {
			const routeName = path.basename(file, path.extname(file)); // Nom du fichier sans extension
			const cssPath = "public/style/" + routeName + ".css";
			const jsPath = "dist/srcs/public/scripts/" + routeName + ".js";

			routes[routeName] = {
				dir: directory,
				file: file,
				useEjs: useEjs,
				css: fs.existsSync("srcs/" + cssPath) ? cssPath : null,
				js: fs.existsSync("srcs/" + jsPath) ? jsPath : null,
			};
		} // peut etre ajouter un else if pour les dossier (recursive)
	});
	return routes;
}

// Charger les routes des répertoires 'public' et 'views'
const publicRoutes = loadRoutesFromDirectory(path.join(__dirname, 'public'), false);
const viewRoutes = loadRoutesFromDirectory(path.join(__dirname, 'views'), true);

// Fusionner les deux ensembles de routes
export const routes = { ...publicRoutes, ...viewRoutes };

export default async function userRoutes(app) {
	app.register(fastifyStatic, {
		root: path.join(__dirname, '.'),
		prefix: '/',
	});

	app.register(fastifyStatic, {
		root: path.join(__dirname, './uploads'),
		prefix: '/uploads/',
		decorateReply: false // évite les conflits avec l'autre instance fastifyStatic
	});

	app.register(fastifyView, {
		engine: { ejs: ejs },
		root: path.join(__dirname, "views"),
	});

	app.register(fastifyFormbody)


	app.get('/', getHome);
	app.get('/:page', getPage);
	app.post('/url', getPost);
	app.post('/languages', getLanguage);
	app.post('/registerUser', checkUserBack);
	app.post('/updateUser', updateUser);
	app.post('/loginUser', login);
	app.post('/logout', logout);
	app.post('/refresh', refresh);
	app.post('/tournament', tournament)
	app.post('/createTournament', createTournament)
	app.post('/local', local)
	app.post('/createLocal', createLocal)
}
