import fs from 'fs';
import path from 'path';
import i18next from '../public/languages/i18n.js';
import { authenticateUser } from "./tokens.js";
import { findUserById, updateUserLanguage, updateSiteLanguage, getSiteLanguage } from "../dist/prisma/seed.js";
import { createInstance } from 'i18next';

export const getLanguage = async (req, reply) => {
	let translations;
	let language = req.body.language;
	
	const supportedLanguages = ["fr", "en", "es", "pt", ""];
	if (!supportedLanguages.includes(language))
		return reply.status(400).send({ error: "Language not supported" });
	
	const response = await authenticateUser(req);
	const siteLanguage = await getSiteLanguage();
	let newLanguage = !siteLanguage ? "en" : siteLanguage.language;

	console.log("ici")
	console.log(newLanguage)
	//Vérifier si l'utilisateur est connecté
	if (response.status === 200) {
		console.log("ici1")
		const user = await findUserById(response.user.id);
		console.log(user.language)
		console.log(language)
		if (language === "" && user.language !== "" && user.language !== null) { //Si l'utilisateur a une langue de préférence et qu'il vient de se reconnecter ou rafraichir la page je la mets
			console.log("if")
			language = user.language;
			await updateSiteLanguage(language)
		}
		else if (language !== "") { //Si l'utilisateur change de langue
			console.log("else if")
			await updateSiteLanguage(language);
			await updateUserLanguage(user.id, language)
		}
		else { //Language est vide, l'utilisateur n'a pas de langue par défaut, je mets la langue du site
			console.log("else")
			language = newLanguage;
			await updateUserLanguage(user.id, language)
		}
		translations = i18next.getResourceBundle(language, 'translation');
	} 
	else {
		console.log("ici2")
		console.log(language)
		console.log(newLanguage)
		if (language === "" && newLanguage !== "") { //Si language est vide et siteLanguage non, c'est que l'utilisateur rafraichit la page
			console.log("if")
			await updateSiteLanguage(newLanguage);
			language = newLanguage;
		}
		else if (language !== "") {//Si l'utilisateur change de langue
			console.log("else if")
			await updateSiteLanguage(language);
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