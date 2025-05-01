import { app } from '../server.js';
import { createUser, findUserByEmail, findUser } from '../dist/prisma/seed.js';
import { loginUser } from './loginUser.js';
import path from 'path';
import fs from 'fs';
import { __dirname } from '../router.js';
import { verifyForm } from '../dist/srcs/middleware/verify.js';
import { parseRequestParts } from '../middleware/parseRequestParts.js';
import { sendEmail, generateCode, verifCode } from './email.js';
import { getLanguageWithoutBody } from './getLanguage.js'

export const verifFormRegister = async (req, reply) => {
	let language = req.cookies.userLanguage;
	if (!language)
		language = "en"
	let jsonLanguage = await getLanguageWithoutBody(language);
	try {
		const parts = req.parts();
		let fields = {};
		for await (const part of parts) {
			if (part.file) {
				if (!part.mimetype.startsWith('image/')) {
					part.file.resume();
					return reply.send({ message: jsonLanguage.verify.invalidFormat });
				}
				part.file.resume();
			}
			else
				fields[part.fieldname] = part.value;
		}
		const email = fields.email;
		const username = fields.username;

		const formResponse = await verifyForm(username, email, fields.password, jsonLanguage);
		if (formResponse.message !== "ok") {
			return reply.send({ message: formResponse.message });
		}

		const user = await findUser(username);
		if (user) {
			return reply.send({ message: jsonLanguage.verify.usernameAlreadyExists });
		}
		const userEmail = await findUserByEmail(email);
		if (userEmail) {
			return reply.send({ message: jsonLanguage.verify.emailAlreadyExists });
		}

		const code = await generateCode(req, reply);
		const response = await sendEmail(email, username, code.code);
		if (response.message !== "ok") {
			return reply.send({ message: response.message });
		}
		return reply
			.setCookie("code_id", code.codeId, {
				httpOnly: true,
				secure: false,
				sameSite: "lax",
				path: "/",
				maxAge: 240,
			})
			.send({ message: "ok" });
	}
	catch (error) {
		return reply.send({ message: "Internal server error" });
	}
}

export const checkUserBack = async (req, reply) => {
	let language = req.cookies.userLanguage;
	let jsonLanguage = await getLanguageWithoutBody(language);
	console.log(req.body)
	try {
		// Utiliser req.parts() pour traiter les fichiers et les champs
		const uploadDir = path.join(__dirname, './uploads');
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		console.log("ici")
		let { fields, fileBuffer, fileName } = await parseRequestParts(req, reply);
		if (!fields) return;
		console.log("ccccccc")

		const password = fields.password;
		const username = fields.username;
		const email = fields.email;

		const user = await findUser(username);
		if (user) {
			return reply.send({ message: jsonLanguage.verify.usernameAlreadyExists });
		}
		const userEmail = await findUserByEmail(email);
		if (userEmail) {
			return reply.send({ message: jsonLanguage.verify.emailAlreadyExists });
		}

		const response = await verifCode(req, reply, fields.verif_email);
		if (response !== "ok") {
			return reply.send({ message: response, code: true });
		}

		console.log(fileName)

		if (!fileName) {
			fileName = `temp_${Date.now()}.png`;
			const filePath = path.join(__dirname, './uploads', username + fileName);
			fs.copyFileSync(path.join(__dirname, "./public/images/flamme.png"), filePath);
		} else {
			const filePath = path.join(__dirname, './uploads', username + fileName);
			fs.writeFileSync(filePath, fileBuffer);
		}

		const hashedPassword = await app.bcrypt.hash(password);
		await createUser(username, hashedPassword, email, '/uploads/' + username + fileName);
		return loginUser(req, reply, password, username);
	} catch (error) {
		return reply.send({message: error.message});
	}
};
