import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { routes } from "../router.js";
import { __dirname } from "../router.js";
import { getAllUsers } from "../dist/prisma/seed.js";

const getObj = async (req, file) => { // a modifier
	if (file === "admin")
		return await getAllUsers() // tmp pour test
	return { name: 'John', age: 24 }; // objet a remplacer par db fonction getUser
}

// traiter la requete post et envoyer la page demandée (voir public/main.js)
export const getPost = async (req, reply) => {
	const file = req.body.url.split("/").pop() || "home"; // a ne pas oublier (moi?id=1) peut etre
	let content, css, js;
	const user = await getObj(req, file);

	// router
	for (const route of Object.keys(routes)) {
		if (file === route) {
			content = routes[route].useEjs // si c'est un ejs alors ejs.renderFile car c'est un template
				? await ejs.renderFile(path.join(routes[route].dir, routes[route].file), { user })
				: fs.readFileSync(path.join(routes[route].dir, routes[route].file), 'utf8');
			css = routes[route].css;
			js = routes[route].js;
		}
	}
	if (content === "") {
		css = path.join(__dirname, 'public', "error_page/style/404.css");
		content = fs.readFileSync(path.join(__dirname, 'public', "error_page/404.html"), 'utf8');
		return reply.code(404).send({ content, css }); // error code a check
	}
	return reply.send({ content, css, js });
};
