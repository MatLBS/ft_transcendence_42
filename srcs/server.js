import Fastify from 'fastify';
import userRoutes from './router.js';
import {__dirname} from './router.js';
import fastifyBcrypt from 'fastify-bcrypt';
import fastifyCookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';

export const app = Fastify({
	logger: true,
});

app.register(fastifyCookie);

app.register(fastifyBcrypt);

app.register(fastifyMultipart, {
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB max file size
		files: 1, // Max number of files
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
