import Fastify from 'fastify';
import userRoutes from './router.js';
import {__dirname} from './router.js';
import fastifyBcrypt from 'fastify-bcrypt';
import fastifyCookie from '@fastify/cookie';


export const app = Fastify({
	// logger: true,
});

app.register(userRoutes);

app.register(fastifyCookie);

app.register(fastifyBcrypt);

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
