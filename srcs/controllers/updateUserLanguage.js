import { authenticateUser } from "./tokens.js";
import { findUserById, updateUserLanguageDB } from "../dist/prisma/seed.js";

export const updateUserLanguage =  async (req, reply) => {
	const language = req.body.language;
	const response = await authenticateUser(req);
	if (response.status !== 200)
		return;
	const user = await findUserById(response.user.id);
	await updateUserLanguageDB(user.id, language)
}