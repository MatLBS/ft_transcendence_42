import fs from 'fs';
import ejs from 'ejs';
import path from 'path';
import { routes } from "../router.js";
import { __dirname } from "../router.js";

export const tournament = async (req, reply) => {

	const route = routes["tournament"];

	const content = await ejs.renderFile(path.join(route.dir, route.file), {message: null});
	
	// let content = fs.readFileSync(, 'utf8');
	return (reply.send({ content }));
}