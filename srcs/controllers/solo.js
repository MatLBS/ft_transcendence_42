import ejs from 'ejs';
import path from 'path';
import { routes } from "../router.js";
import { __dirname } from "../router.js";

export const solo = async (req, reply) => {

	const route = routes["solo"];

	const content = await ejs.renderFile(path.join(route.dir, route.file), {message: null});
	
	return (reply.send({ content }));
}