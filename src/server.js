import Fastify from 'fastify'
import fastifyView from "@fastify/view"
import fastifyFormBody from '@fastify/formbody'
import fastifyStatic from "@fastify/static"
import ejs from "ejs"
import routes from './routes/routes.js'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'

const fastify = Fastify()

const __dirname = dirname(fileURLToPath(import.meta.url))
const __dirnameSup = dirname(dirname(fileURLToPath(import.meta.url)))



fastify.register(fastifyView, {
	engine: { ejs },
	root: join(__dirname, 'views'),
})

fastify.register(fastifyFormBody)

fastify.register(fastifyStatic, {
	root: join(__dirnameSup, 'public')
})

// console.log(join(__dirnameSup, 'public'))

fastify.register(routes)

fastify.setErrorHandler((error, req, res) => {
})

const start = async () => {
	try {
		await fastify.listen({
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
