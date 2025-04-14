import fs from 'fs';
import path from 'path';
import i18next from '../public/languages/i18n.js';
import { authenticateUser } from "./tokens.js";
import { findUserById, updateUserLanguageDB } from "../dist/prisma/seed.js";

export const getLanguage = async (req, reply) => {
	let translations;
	let language = req.body.language;
	
	const supportedLanguages = ["fr", "en", "es", "pt", ""];
	if (!supportedLanguages.includes(language))
		return reply.status(400).send({ error: "Language not supported" });
	
	const response = await authenticateUser(req);
	//Vérifier si l'utilisateur est connecté
	if (response.status === 200) {
		const user = await findUserById(response.user.id);
		language = user.language !== null ? user.language : language;
	} 
	translations = i18next.getResourceBundle(language, 'translation');
	return (translations);
}

export const getLanguageWithoutBody = async (language) => {

	const supportedLanguages = ["fr", "en", "es", "pt"];
	if (!supportedLanguages.includes(language)) {
		return reply.status(400).send({ error: "Language not supported" });
	}

	const translations = i18next.getResourceBundle(language, 'translation');
	return (translations);
}