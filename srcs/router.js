import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import fastifyStatic from '@fastify/static';
import fastifyView from '@fastify/view';
import fastifyFormbody from '@fastify/formbody';
import fastifyBcrypt from 'fastify-bcrypt';

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
			// console.log("srcs/" + jsPath + " " + fs.existsSync("srcs/" + jsPath));

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
const routes = { ...publicRoutes, ...viewRoutes };

// pour gerer les url directe
const getPage = async (req, reply) => {
	if (req.params.page.endsWith('.js') || req.params.page.endsWith('.css'))
		return reply.sendFile(req.params.page);

	return reply.view("index.ejs");
}

const getHome = async (req, reply) => {
	return reply.view("index.ejs");
}

// traiter la requete post et envoyer la page demandée (voir public/main.js)
const getPost = async (req, reply) => {
	const file = req.body.url.split("/").pop() || "home"; // a ne pas oublier (moi?id=1)
	let content = "", css = "", js = "";

	const user = { name: 'John', age: 24 }; // objet a remplacer par db
	// router
	for (const route of Object.keys(routes)) {
		if (file === route) {
			content = routes[route].useEjs // si c'est un ejs alors ejs.renderFile car c'est un template
				? await ejs.renderFile(path.join(routes[route].dir, routes[route].file), { user })
				: fs.readFileSync(path.join(routes[route].dir, routes[route].file), 'utf8');
			css = routes[route].css;
			js = routes[route].js;
		}
	}
	if (content === "") {
		css = path.join(__dirname, 'public', "error_page/style/404.css");
		content = fs.readFileSync(path.join(__dirname, 'public', "error_page/404.html"), 'utf8');
		return reply.code(404).send({ content, css }); // error code a check
	}
	return reply.send({ content, css, js });
};

const createUser = async (req, reply) => {
	try {
		// await validatePassword(req.body.password)
		const hashedPassword = await app.bcrypt.hash(req.body.password, 10);
		await createUser(req.body.username, hashedPassword, req.body.email);
		reply.redirect('/home')
	}
	catch {
		console.log("error");
		reply.redirect('/register')
	}
};

export default async function userRoutes(app) {
	app.register(fastifyStatic, {
		root: path.join(__dirname, '.'),
		prefix: '/',
	});

	app.register(fastifyView, {
		engine: { ejs: ejs },
		root: path.join(__dirname, "views"),
	});

	app.register(fastifyBcrypt);
	
	app.register(fastifyFormbody)

	app.get('/:page', getPage);
	app.get('/', getHome);
	app.post('/url', getPost);
	app.post('/register', createUser);
}
