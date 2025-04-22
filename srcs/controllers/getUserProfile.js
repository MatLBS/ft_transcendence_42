import { findUser } from '../dist/prisma/seed.js';
import { getErrorPage } from './errorPage.js';
import ejs from 'ejs';
import { authenticateUser } from "./tokens.js";
import { isFriend } from '../dist/prisma/friends.js';

export const getUserProfile = async (req, reply, username) => {
	const jsonLanguage = req.body.jsonLanguage;
	const { page } = req.params;
	const finalPage = page ?? username;
	const user = await findUser(finalPage);
	if (!user)
		await getErrorPage(req, reply);
	const response = await authenticateUser(req);

	const isConnected = response.status === 200;
	const himself = isConnected && response.user.id === user.id;
	const friend = isConnected ? await isFriend(response.user.id, user.id) : false;

	const content = await ejs.renderFile("/usr/src/app/srcs/views/users/viewProfile.ejs", { user, jsonLanguage, isConnected, friend, himself });
	let css ="", js = "/dist/srcs/public/scripts/users/viewProfile.js";
	return reply.send({ content, css, js, isConnected });
}
