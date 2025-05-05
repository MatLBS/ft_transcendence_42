import Fastify from 'fastify';
import userRoutes from './router.js';
import {__dirname} from './router.js';
import fastifyBcrypt from 'fastify-bcrypt';
import fastifyCookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';
import cors from '@fastify/cors';
import { collectDefaultMetrics, register, Counter, Histogram } from 'prom-client';

// Créer les métriques
export const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

export const app = Fastify({
  // logger: true,
});

// Middleware pour collecter les métriques
app.addHook('onRequest', async (request, reply) => {
  request.startTime = process.hrtime();
});

app.addHook('onResponse', async (request, reply) => {
  const duration = process.hrtime(request.startTime);
  const durationInSeconds = duration[0] + duration[1] / 1e9;
  
  httpRequestCounter.inc({
    method: request.method,
    route: request.routerPath || request.url,
    status_code: reply.statusCode
  });
  
  httpRequestDuration.observe({
    method: request.method,
    route: request.routerPath || request.url,
    status_code: reply.statusCode
  }, durationInSeconds);
});

app.register(fastifyCookie);

app.register(fastifyBcrypt);

// Enable default system metrics
collectDefaultMetrics({ timeout: 5000 });

// Create a metrics endpoint
app.get('/metrics', async (req, res) => {
  res.header('Content-Type', register.contentType);
  res.send(await register.metrics());
});

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
