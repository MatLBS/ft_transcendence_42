import { authenticateUser } from "./tokens.js";
import { findUserById, updateUserLanguageDB } from "../dist/prisma/seed.js";

export const updateUserLanguage =  async (req, reply) => {
	const language = req.body.language;
	const response = await authenticateUser(req);
	reply
		.setCookie("userLanguage", language, {
			httpOnly: true,
			secure: true,
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24,
		})
	if (response.status !== 200)
		return;
	const user = await findUserById(response.user.id);
	if (!user)
		return;
	await updateUserLanguageDB(user.id, language)
}
