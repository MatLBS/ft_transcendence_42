import fs from 'fs';
import path from 'path';
import i18next from '../public/languages/i18n.js';

export const setLanguage = async (req, reply) => {

	const supportedLanguages = ["fr", "en", "es", "pt"];
	const language = req.body.language;
	if (!supportedLanguages.includes(language)) {
		return reply.status(400).json({ error: "Language not supported" });
	}

	// try {
	// 	const filePath = path.join(process.cwd(), 'srcs/public/languages', `${language}.json`);
	// 	const fileContent = fs.readFileSync(filePath)
	// 	const translations = JSON.parse(fileContent);
	// 	return (reply.send({ translations }));
	// } catch (error) {
	// 	console.error("Error loading language file:", error);
	// 	return reply.status(500).json({ error: "Failed to load language file" });
	// }

	if (!i18next.hasResourceBundle(language, 'translation')) {
		return reply.code(400).send({ error: 'Unsupported language' });
	}

	const translations = i18next.getResourceBundle(language, 'translation');
	return (translations);
}