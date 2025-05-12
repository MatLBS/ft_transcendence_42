import { findUser, findUserById } from '../dist/prisma/seed.js';
import ejs from 'ejs';
import { authenticateUser } from "./tokens.js";
import { isFriend } from '../dist/prisma/friends.js';
import { errorPage } from './errorPage.js';

export const getUserProfile = async (req, reply, username) => {
	const response = await authenticateUser(req);
	try {
		let userLog = await findUserById(response.user.id);
		if (!response.status === 200 || !userLog) {
			return await errorPage(req, reply, response, 401);
		}
		const jsonLanguage = req.body.jsonLanguage;
		const { page } = req.params;
		const finalPage = page ?? username;
		const user = await findUser(finalPage);
		if (!user)
			return await errorPage(req, reply, response, 404);

		const isConnected = response.status === 200;
		const himself = isConnected && response.user.id === user.id;
		const friend = isConnected ? await isFriend(response.user.id, user.id) : false;

		const content = await ejs.renderFile("/usr/src/app/srcs/views/users/viewProfile.ejs", { user, jsonLanguage, isConnected, friend, himself });
		let css = "/public/style/users/viewProfile.css", js = "/dist/srcs/public/scripts/users/viewProfile.js";
		return reply.send({ content, css, js, isConnected });
	} catch (error) {
		console.error(error);
		return await errorPage(req, reply, response, 500);
	}
}
