import fs from 'fs';
import path from 'path';
import i18next from '../public/languages/i18n.js';
import { authenticateUser } from "./tokens.js";
import { findUserById, updateUserLanguageDB } from "../dist/prisma/seed.js";

export const getLanguage = async (req, reply) => {
	let translations;
	let language = req.body.language;
	console.log("Language from body: ", language);
	
	const supportedLanguages = ["fr", "en", "es", "pt", ""];
	if (!supportedLanguages.includes(language))
		return reply.status(400).send({ error: "Language not supported" });
	
	const response = await authenticateUser(req);
	if (response.status === 200) {
		const user = await findUserById(response.user.id);
		if (user)
			language = user.language !== null ? user.language : language;
	}
	translations = i18next.getResourceBundle(language, 'translation');
	return (translations);
}

export const getLanguageWithoutBody = async (req) => {
	let language;
	const response = await authenticateUser(req);
	if (response.status === 401){
		if (req.cookies.userLanguage !== null && req.cookies.userLanguage !== undefined)
			language = req.cookies.userLanguage;
		else 
			language = "en";
	}
	else {
		const user = await findUserById(response.user.id);
		if (user && user.language)
			language = user.language;
		else
			language = req.cookies.userLanguage || "en";
	}
	
	const supportedLanguages = ["fr", "en", "es", "pt"];
	if (!supportedLanguages.includes(language)) {
		console.log("ici")
		return { error: true, status: 400, message: "Language not supported" };
	}
	const translations = i18next.getResourceBundle(language, 'translation');
	return (translations);
}