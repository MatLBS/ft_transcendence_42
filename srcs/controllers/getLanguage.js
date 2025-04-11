import fs from 'fs';
import path from 'path';
import i18next from '../public/languages/i18n.js';
import { authenticateUser } from "./tokens.js";
import { findUserById, updateUserLanguage, updateSiteLanguage, getSiteLanguage } from "../dist/prisma/seed.js";

export const getLanguage = async (req, reply) => {
	let translations;
	let language = req.body.language;
	
	const supportedLanguages = ["fr", "en", "es", "pt", ""];
	if (!supportedLanguages.includes(language))
		return reply.status(400).send({ error: "Language not supported" });
	
	const response = await authenticateUser(req);
	const siteLanguage = await getSiteLanguage();
	let newLanguage = !siteLanguage ? "en" : siteLanguage.language;

	//Vérifier si l'utilisateur est connecté
	if (response.status === 200) {
		const user = await findUserById(response.user.id);
		if (language === "" && user.language !== "" && user.language !== null) { //Si language est vide c'est que l'utilisateur se connecte/reconnecte pour la première fois, s'il a une langue de préférence je la mets
			language = user.language;
			await updateSiteLanguage(language)
		}
		else if (language !== "") { //Si l'utilisateur change de langue
			await updateSiteLanguage(language);
			await updateUserLanguage(user.id, language)
		}
		else { //Language est vide, l'utilisateur n'a pas de langue par défaut, je mets la langue du site
			language = newLanguage;
			await updateUserLanguage(user.id, language)
		}
		translations = i18next.getResourceBundle(language, 'translation');
	} 
	else {
		if (language === "" && newLanguage !== "") { //Si language est vide et siteLanguage non, c'est que l'utilisateur rafraichit la page
			await updateSiteLanguage(newLanguage);
			language = newLanguage;
		}
		else if (language !== "") {//Si l'utilisateur change de langue
			await updateSiteLanguage(language);
		}
		else { //Si language est vide et siteLanguage aussi, c'est que l'utilisateur se connecte pour la première fois sur le site, je met alors la langue par défaut, anglais(en)
			await updateSiteLanguage("en");
			language = "en";
		}
		translations = i18next.getResourceBundle(language, 'translation');
	}
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