import fs from 'fs';
import path from 'path';
import i18next from '../public/languages/i18n.js';
import { authenticateUser } from "./tokens.js";
import { findUserById, updateUserLanguage } from "../dist/prisma/seed.js";

export const setLanguage = async (req, reply) => {

	const language = req.body.language;
	
	const supportedLanguages = ["fr", "en", "es", "pt"];
	if (!supportedLanguages.includes(language)) {
		return reply.status(400).send({ error: "Language not supported" });
	}

	if (!i18next.hasResourceBundle(language, 'translation')) {
		return reply.code(400).send({ error: 'Unsupported language' });
	}

	const translations = i18next.getResourceBundle(language, 'translation');

	const response = await authenticateUser(req);
	const user = await findUserById(response.user.id);
	await updateUserLanguage(user.id, language)
	return (translations);
}

export const setLanguageGame = async (language) => {

	console.log("ici")
	
	const supportedLanguages = ["fr", "en", "es", "pt"];
	if (!supportedLanguages.includes(language)) {
		return reply.status(400).send({ error: "Language not supported" });
	}

	if (!i18next.hasResourceBundle(language, 'translation')) {
		return reply.code(400).send({ error: 'Unsupported language' });
	}
	const translations = i18next.getResourceBundle(language, 'translation');
	return (translations);
}