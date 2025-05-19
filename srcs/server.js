import Fastify from 'fastify';
import fs from 'fs';
import path from 'path';
import userRoutes from './router.js';
import { setupMetrics } from './controllers/metricsPrometheus.js';
import {__dirname} from './router.js';
import fastifyBcrypt from 'fastify-bcrypt';
import fastifyCookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';

const parent__dirname = path.join(__dirname, '..');

export const app = Fastify({
	// logger: true,
	https: {
		key: fs.readFileSync(path.join(parent__dirname, "/certs/key.pem")),
		cert: fs.readFileSync(path.join(parent__dirname, "/certs/cert.pem")),
	},
});

setupMetrics(app);
app.register(fastifyCookie);

app.register(fastifyBcrypt);

app.register(websocket);
app.decorate('wsClients', new Map());

app.register(cors, {
	origin: ["https://accounts.google.com", "http://localhost:3000"], // Add allowed origins
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
	credentials: true, // Allow cookies to be sent with requests
});

app.register(fastifyMultipart, {
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB max file size
		files: 5, // Max number of files
	},
	attachFieldsToBody: false, // Ne pas attacher les champs au body, nous les traiterons avec req.parts()
});

app.register(userRoutes);

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
