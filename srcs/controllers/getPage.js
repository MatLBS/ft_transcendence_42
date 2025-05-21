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


/**
 * Asynchronously adds additional content, CSS, and JavaScript to an HTML template.
 *
 * @async
 * @param {string} contentAdd - The HTML content to be added inside the `app` element.
 * @param {string} [css] - The URL of the CSS file to be included in the `<head>` section. Optional.
 * @param {string} [js] - The URL of the JavaScript file to be included in the `<body>` section. Optional.
 * @returns {Promise<string>} A promise that resolves to the updated HTML content as a string.
 */
const addContent = async (contentAdd, css, js) => {
	const content = await ejs.renderFile(path.join(__dirname, 'views', '/index.ejs'));
	let updatedContent = content.replace('app">', `app">${contentAdd}`);

	if (css)
		updatedContent = updatedContent.replace('</head>', `<link id="css" rel="stylesheet" href="${css}">\n</head>`);
	if (js)
		updatedContent = updatedContent.replace('</body>', `<script id="js" type="module" src="${js}"></script>\n</body>`);

	return updatedContent;
}

/**
 * Handles direct URLs and generates the appropriate page.
 *
 * This function processes the incoming request URL to determine the page to be generated.
 * If the URL corresponds to a user-specific page (e.g., "/users/:id"), it generates the
 * page for that user. Otherwise, it generates a page based on the last segment of the URL
 * or defaults to the "home" page if no specific segment is provided.
 *
 * @async
 * @param {Object} req - The request object containing the URL and other request details.
 * @param {Object} reply - The reply object used to send the response.
 * @returns {Promise<void>} Resolves when the page is successfully generated and send.
 */
export const getPage = async (req, reply) => {
	let file = req.url.split("/");
	if (file[1] === "users")
		return generatePage(req, reply, "users/" + file.pop());
	file = file.pop() || "home";
	return generatePage(req, reply, file);
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

const errorContent = async (jsonLanguage, isConnected) => {
	let content = await ejs.renderFile(path.join(__dirname, 'views/error_page/404.ejs'), { jsonLanguage, isConnected });
	content = await addErrorContent(content);
	return content;
}

/**
 * Renders the profile page content based on the provided parameters.
 *
 * @async
 * @function profilPage
 * @param {Object} jsonLanguage - The JSON object containing language-specific strings.
 * @param {Object} response - The response object containing user information.
 * @param {string} file - The file path uhsed to determine te user profile.
 * @param {boolean} isConnected - Indicates whether the user is logged in.
 * @returns {Promise<string>} The rendered HTML content for the profile page.
 */
const profilPage = async (jsonLanguage, response, file, isConnected) => {
	let content = "";
	const finalPage = decodeURIComponent(file.split("/").pop());
	const user = await findUser(finalPage);
	if (!user) {
		content = await errorContent(jsonLanguage, isConnected);
	} else {
		const himself = isConnected && response.user.id === user.id;
		const friend = isConnected ? await isFriend(response.user.id, user.id) : false;
		content = await ejs.renderFile("/usr/src/app/srcs/views/users/viewProfile.ejs", { user, jsonLanguage, isConnected, friend, himself });
		content = await addContent(content, "/public/style/users/viewProfile.css", "/dist/srcs/public/scripts/users/viewProfile.js");
	}
	return content;
}

/**
 * Generates and sends an HTML page as a response based on the requested file and user authentication status.
 *
 * @async
 * @function generatePage
 * @param {Object} req - The request object, containing cookies and other request data.
 * @param {Object} reply - The reply object used to send the response back to the client.
 * @param {string} file - The requested file path used to determine the content to render.
 * @returns {Promise<Object>} The reply object with the generated HTML content and appropriate headers.
 *
 */
const generatePage = async (req, reply, file) => {
	let response = null, user = null, isConnected = false, friends = null;
	let jsonLanguage = await getLanguageWithoutBody(req.cookies.userLanguage);
	({ response, user, isConnected, friends } = await handleAuthentication(req, reply, file));

	let content = "", code = 200;
	const route = routes[file];
	if (route) {
		content = await ejs.renderFile(path.join(route.dir, route.file), { user, jsonLanguage, friends, isConnected});
		content = await addContent(content, route.css, route.js);
	}
	else if (file.includes("users/")) {
		if (response.status !== 200 || !(user = await findUserById(response.user.id)))
			return reply.redirect("/login");
		content = await profilPage(jsonLanguage, response, file, isConnected);
	} else {
		content = await errorContent(jsonLanguage, isConnected);
		code = 404;
	}
	if (response.status === 200 && response.newAccessToken) {
		reply
			.setCookie('access_token', response.newAccessToken, {
				httpOnly: true,
				secure: true,
				sameSite: 'Strict',
				path: "/",
			})
	}
	return reply
		.code(code)
		.type('text/html')
		.header('Content-Type', 'text/html; charset=utf-8')
		.send(content);
}

export const handleFavicon = async (req, reply) => {
	return;
}
