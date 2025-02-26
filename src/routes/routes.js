import { displayAbout, displayIndex } from "../controllers/handleViews.js"
import fastify from 'fastify'

async function routes(fastify, options) {
	fastify.get('/', displayIndex)

	fastify.get('/about', displayAbout)
}

export default routes