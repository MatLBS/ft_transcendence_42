// Import Fastify
import Fastify from 'fastify';
import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { fileURLToPath } from 'url';
import fastifyStatic from '@fastify/static';
import fastifyView from '@fastify/view';

const app = Fastify({ logger: true })

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.register(fastifyStatic, {
	root: path.join(__dirname, '.'),
	prefix: '/',
});

app.register(fastifyView, {
	engine: { ejs: ejs },
	root: path.join(__dirname, "views"),
});

function loadRoutesFromDirectory(directory, useEjs) {
	const routes = {};
	const files = fs.readdirSync(directory);

	files.forEach(file => {
		const routeName = path.basename(file, path.extname(file)); // Nom du fichier sans extension
		routes[routeName] = {
			dir: directory,
			file: file,
			useEjs: useEjs,
			css: "public/style/" + routeName + ".css"
		};
	});
	return routes;
}

// Charger les routes des répertoires 'public' et 'views'
const publicRoutes = loadRoutesFromDirectory(path.join(__dirname, 'public'), false);
const viewRoutes = loadRoutesFromDirectory(path.join(__dirname, 'views'), true);

// Fusionner les deux ensembles de routes
const routes = { ...publicRoutes, ...viewRoutes };

// pour gerer les url directe
app.get('/:page', async (req, reply) => {
	if (req.params.page.endsWith('.ts') || req.params.page.endsWith('.css')) {
		return reply.sendFile(req.params.page);
	}
	return reply.view("index.ejs");
});

app.get('/', async (req, reply) => {
	return reply.view("index.ejs");
});

// traiter la requete post et envoyer la page demandée (voir public/main.js)
app.post('/url', async (req, reply) => {
	let file = req.body.url.split("/").pop();
	if (file === "")
		file = "home";
	let content = "";
	let css = "";
	// objet a remplacer par db
	const user = { name: 'John', age: 24 };
	// router
	for (const route of Object.keys(routes)) {
		if (file === route) {
			if (routes[route].useEjs){
				css = routes[route].css;
				content = await ejs.renderFile(path.join(routes[route].dir, routes[route].file), { user });
			}
			else {
				css = routes[route].css;
				content = fs.readFileSync(path.join(routes[route].dir, routes[route].file), 'utf8');
			}
		}
	}
	if (content === "") {
		css = path.join(__dirname, 'public', "error_page/style/404.css");
		content = fs.readFileSync(path.join(__dirname, 'public', "error_page/404.html"), 'utf8');
		return reply.code(404).send({ content, css }); // error code a check
	}
	return reply.send({ content, css });
});

// lancer le serv
const start = async () => {
	try {
		// grace a fastify, on peut lancer le serveur avec listen
		await app.listen({
			port: 3000,
			host: "0.0.0.0",
		});
		console.log("Server is running on http://localhost:3000");
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

start();
