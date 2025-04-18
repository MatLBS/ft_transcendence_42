import { searchUsername } from '../dist/prisma/seed.js';

export const search = async (req, reply) => {
	try {
		const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
		const searchTerm = body.searchValue;
		const results = await searchUsername(searchTerm);
		reply.send({ users: results });
	} catch (error) {
		console.error('Error searching in database:', error);
		reply.status(500).send({ error: 'Internal server error' });
	}
}
