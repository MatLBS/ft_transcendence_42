import {
	collectDefaultMetrics,
	register,
	Counter,
	Histogram,
  } from 'prom-client';
  
export function setupMetrics(app) {
	// 1) Enable default system metrics
	collectDefaultMetrics({ timeout: 5000, registers: [register] });
	
	const httpRequestCounter = new Counter({
			  name: 'http_requests_total',
			  help: 'Total HTTP requests',
			  labelNames: ['method', 'route', 'status_code'],
			  registers: [register],
		  });
  
	const httpRequestDuration = new Histogram({
	  name: 'http_request_duration_seconds',
	  help: 'Duration of HTTP requests in seconds',
	  labelNames: ['method', 'route', 'status_code'],
	  buckets: [0.1, 0.5, 1, 2, 5],
	  registers: [register],
	});
  
	// 3) Hook into Fastify lifecycle
	app.addHook('onRequest', async (request) => {
	  request.startTime = process.hrtime();
	});
  
	app.addHook('onResponse', async (request, reply) => {
	  const [sec, nano] = process.hrtime(request.startTime);
	  const durationInSeconds = sec + nano / 1e9;
	  const labels = {
		method: request.method,
		route: request.routerPath || request.url,
		status_code: reply.statusCode,
	  };
	  httpRequestCounter.inc(labels);
	  httpRequestDuration.observe(labels, durationInSeconds);
	});
  
	// 4) Expose /metrics endpoint
	app.get('/metrics', async (req, res) => {
	  res.header('Content-Type', register.contentType);
	  return await register.metrics();
	});
}