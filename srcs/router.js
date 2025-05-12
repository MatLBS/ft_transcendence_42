
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import fastifyStatic from '@fastify/static';
import fastifyView from '@fastify/view';
import Chart from 'chart.js/auto';
import fastifyFormbody from '@fastify/formbody';
import { checkUserBack, verifFormRegister } from './controllers/createUser.js';
import { login, verifLogin } from './controllers/loginUser.js';
import { getPost } from './controllers/getPost.js';
import { getLanguage } from './controllers/getLanguage.js';
import { handleFavicon, getPage } from './controllers/getPage.js';
import { logout, quit } from './controllers/logout.js';
import { refresh } from './controllers/tokens.js';
import { tournament } from './controllers/tournament.js';
import { createTournament, nextMatchTournament, updateResultTournamentGame, getWinnerTournament } from './controllers/createTournament.js';
import { local } from './controllers/local.js';
import { updateUserLanguage } from './controllers/updateUserLanguage.js';
import { updateUser, updateUserGoogle, updateUserTwoFA } from './controllers/updateUser.js';
import {getUser, getExternalUser, getUserId} from './controllers/getUser.js';
import { googleAuth, googleCallback } from './controllers/google.js';
import {solo} from './controllers/solo.js';
import { createSoloGame, updateResultSoloGame } from './controllers/createSolo.js';
import { createLocalGame, updateResultLocalGame } from './controllers/createLocal.js';
import { getMatchsResults, getExternalMatchsResults } from './controllers/getMatchs.js';
import { getErrorPageDirect } from './controllers/errorPage.js';
import { search } from './controllers/search.js';
import { getUserProfile } from './controllers/getUserProfile.js';
import { addFriends, deleteFriends } from './controllers/handleFriends.js';
import { webSocketConnect, webSocketConnectNewGame, webSocketConnectMessages } from './controllers/webSocket.js';
import { getAllMessages, enterNewMessage } from './controllers/handleMessages.js';

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadRoutesFromDirectory(directory, useEjs) {
	const routes = {};
	const files = fs.readdirSync(directory);

	files.forEach(file => {
		if (path.extname(file) === ".html" || path.extname(file) === ".ejs") {
			const routeName = path.basename(file, path.extname(file)); // Nom du fichier sans extension
			const cssPath = "/public/style/" + routeName + ".css";
			const jsPath = "/dist/srcs/public/scripts/" + routeName + ".js";

			routes[routeName] = {
				dir: directory,
				file: file,
				useEjs: useEjs,
				css: fs.existsSync("srcs/" + cssPath) ? cssPath : null,
				js: fs.existsSync("srcs/" + jsPath) ? jsPath : null,
			};
		}
	});
	return routes;
}

export const routes = loadRoutesFromDirectory(path.join(__dirname, 'views'), true);

export default async function userRoutes(app) {
	app.register(fastifyStatic, {
		root: path.join(__dirname, '.'),
		prefix: '/',
	});

	app.register(fastifyStatic, {
		root: path.join(__dirname, './uploads'),
		prefix: '/uploads/',
		decorateReply: false,
	});

	app.register(fastifyView, {
		engine: { ejs: ejs },
		root: path.join(__dirname, "views"),
	});
	
	app.register(fastifyFormbody)

	app.get('/', getPage);
	app.get('/:page', getPage);
	app.post('/url', getPost);
	app.post('/languages', getLanguage);

	app.get('/favicon.ico', handleFavicon);

	app.get('/users/:page', getPage);

	app.post('/registerUser', checkUserBack);
	app.post('/verifForm', verifFormRegister);

	app.post('/login', login);
	app.post('/verifLogin', verifLogin);

	app.get('/ws', { websocket: true }, webSocketConnect);
	app.get('/wsNewGame/:page', { websocket: true }, webSocketConnectNewGame);
	app.get('/wsMessages/:page', { websocket: true }, webSocketConnectMessages);

	app.post('/updateUser', updateUser);
	app.post('/updateUserGoogle', updateUserGoogle);
	app.post('/updateTwoFA', updateUserTwoFA);

	app.get('/addFriends/:page', addFriends);
	app.get('/deleteFriends/:page', deleteFriends);

	app.get('/logout', logout);

	app.post('/quit', quit);

	app.post('/search', search);

	app.post('/refresh', refresh);
	app.post('/tournament', tournament);
	app.post('/createTournament', createTournament);
	app.post('/local', local);
	app.post('/createLocal', createLocalGame);
	app.get('/auth/google', googleAuth);
	app.get('/auth/google/callback', googleCallback);
	app.post('/updateUserLanguage', updateUserLanguage);
	app.get('/getUser', getUser);
	app.get('/getUserId', getUserId);
	app.get('/getExternalUser/:page',getExternalUser);
	app.post('/solo',solo);
	app.post('/createSolo', createSoloGame);
	app.post('/postResultLocal', updateResultLocalGame);
	app.post('/postResultSolo', updateResultSoloGame);
	app.get('/getNextMatchTournament', nextMatchTournament);
	app.post('/postResulTournament', updateResultTournamentGame);
	app.get('/getMatchsResults', getMatchsResults);
	app.get('/getExternalMatchsResults/:page', getExternalMatchsResults);
	app.get('/getWinnerTournament', getWinnerTournament);

	app.setNotFoundHandler(getErrorPageDirect);

	app.post('/getAllMessages', getAllMessages);
	app.post('/enterNewMessage', enterNewMessage);


	app.get('/test/error', async (request, reply) => {
		reply.code(500).send({ error: "Internal server error" });
	  });
	  
	  app.get('/test/bad-request', async (request, reply) => {
		reply.code(400).send({ error: "Bad request" });
	  });
}
