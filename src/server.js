import Fastify from 'fastify'
import fastifyView from "@fastify/view"
import fastifyFormBody from '@fastify/formbody'
import fastifyStatic from "@fastify/static"
import ejs from "ejs"
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'

const app = Fastify()

const __dirname = dirname(fileURLToPath(import.meta.url))

// console.log(__dirname)

app.register(fastifyView, {
  engine: {
      ejs
  },
  root: join(__dirname, 'views'),
})

app.register(fastifyFormBody)

app.register(fastifyStatic, {
  root: join(__dirname, 'public')
})

app.get('/', async (req, res) => {
  res.view('index.ejs')
})

app.get('/about', async (req, res) => {
  res.view('about.ejs', { name: "Mateo" })
})

app.setErrorHandler((error, req, res) => {
})

const start = async () => {
  try {
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
