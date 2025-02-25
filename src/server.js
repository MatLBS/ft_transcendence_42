import Fastify from 'fastify'
import fastifyView from "@fastify/view"
import fastifyFormBody from '@fastify/formbody'
import fastifyStatic from "@fastify/static"
import ejs from "ejs"
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'

const app = Fastify()
const rootDir = dirname(fileURLToPath(import.meta.url))

app.register(fastifyView, {
  engine: {
      ejs
  }
})

app.register(fastifyFormBody)

app.register(fastifyStatic, {
  root: join(rootDir, 'public')
})

app.get('/', async (req, res) => {
  res.send("Welcome to FT_TRANSCENDENCE !")
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
