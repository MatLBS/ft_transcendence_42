import { authenticateUser } from "./tokens.js";
import { __dirname, routes } from "../router.js";
import { findUser } from '../dist/prisma/seed.js';
import path from "path";
import ejs from "ejs";
import { getLanguageWithoutBody } from "./getLanguage.js"
import { findUserById } from "../dist/prisma/seed.js";
import { needLogin, dontNeedLogin } from "./getPost.js";
import { addErrorContent } from "./errorPage.js";
import { isFriend } from '../dist/prisma/friends.js';
import { getFollowedUsers } from "../dist/prisma/friends.js";

const addContent = async (contentAdd, css, js) => {
	const content = await ejs.renderFile(path.join(__dirname, 'views', '/index.ejs'));
	let updatedContent = content.replace('app">', `app">${contentAdd}`);

	if (css)
		updatedContent = updatedContent.replace('</head>', `<link id="css" rel="stylesheet" href="${css}">\n</head>`);
	if (js)
		updatedContent = updatedContent.replace('</body>', `<script id="js" type="module" src="${js}"></script>\n</body>`);

	return updatedContent;
}

const handleAuthentication = async (req, reply, file) => {
	const response = await authenticateUser(req);
	let isConnected = false, user = null, friends = null;
	if (response.status === 200 && (user = await findUserById(response.user.id))) {
		isConnected = true;
		if (dontNeedLogin(file))
			return reply.redirect("/");
		user.google = response.user.google;
		friends = await getFollowedUsers(user.id);
	} else {
		if (needLogin(file))
			return reply.redirect("/login");
	}
	return { response, user, isConnected, friends };
};

export const getPage = async (req, reply) => {
	// pour trouver le fichier a afficher
	let file = req.url.split("/");
	if (file[1] === "users")
		return generatePage(req, reply, "users/" + file[2]);
	file = file.pop() || "home";
	return generatePage(req, reply, file);
}

const generatePage = async (req, reply, file) => {
	// Authentification de l'utilisateur
	let response = null, user = null, isConnected = false, friends = null;
	let jsonLanguage = await getLanguageWithoutBody(req.cookies.userLanguage);
	({ response, user, isConnected, friends } = await handleAuthentication(req, reply, file));

	let content = "";
	const route = routes[file];
	if (route) {
		content = await ejs.renderFile(path.join(route.dir, route.file), { user, jsonLanguage, friends, isConnected});
		content = await addContent(content, route.css, route.js);
	}
	else if (file.includes("users")) {
		const finalPage = file.split("/").pop();
		user = await findUser(finalPage);
		if (!user) // tout mettre dans une fonction + clean code
			return await errorPage(req, reply, response, 404); // a changer par erreur direct
		const himself = isConnected && response.user.id === user.id;
		const friend = isConnected ? await isFriend(response.user.id, user.id) : false;
		content = await ejs.renderFile("/usr/src/app/srcs/views/users/viewProfile.ejs", { user, jsonLanguage, isConnected, friend, himself });
		content = await addContent(content, "/public/style/users/viewProfile.css", "/dist/srcs/public/scripts/users/viewProfile.js");
	} else {
		content = await ejs.renderFile(path.join(__dirname, 'views/error_page/404.ejs'), { jsonLanguage, isConnected });
		content = await addErrorContent(content);
	}

	if (response.status === 200 && response.newAccessToken) {
		reply
			.setCookie('access_token', response.newAccessToken, {
				httpOnly: false,
				secure: false,
				sameSite: 'Strict',
				path: "/",
			})
	}
	return reply
		.code(200)
		.type('text/html')
		.header('Content-Type', 'text/html; charset=utf-8')
		.send(content);
}

export const handleFavicon = async (req, reply) => {
	return;
}
