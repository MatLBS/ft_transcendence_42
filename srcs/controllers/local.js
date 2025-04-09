import ejs from 'ejs';
import path from 'path';
import { routes } from "../router.js";
import { __dirname } from "../router.js";
import { findUserById } from "../dist/prisma/seed.js";
import { authenticateUser } from "./tokens.js";
import { setLanguageGame } from "./setLanguage.js"

export const local = async (req, reply) => {

	const response = await authenticateUser(req);
	let language = await findUserById(response.user.id)
	language = language.language

	console.log(language)

	console.log("local")

	const jsonLanguage = await setLanguageGame(language);

	const route = routes["local"];
	const content = await ejs.renderFile(path.join(route.dir, route.file), {message: null, jsonLanguage});
	return (reply.send({ content }));
}