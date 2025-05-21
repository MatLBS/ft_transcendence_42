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

const isExist = async (req, username, email) => {
	// let language = req.cookies.userLanguage || "en";

	const jsonLanguage = await getLanguageWithoutBody(req);

	const user = await findUser(username);
	if (user) {
		return jsonLanguage.verify.usernameAlreadyExists ;
	}

	const userEmail = await findUserByEmail(email);
	if (userEmail) {
		return jsonLanguage.verify.emailAlreadyExists ;
	}
}

const registerUser = async (req, reply, parsedParts, twoFa) => {
	const { username, email, password } = parsedParts.fields;
	let fileProfil = parsedParts.fileProfil;
	let fileBg = parsedParts.fileBg;

	if (!fileProfil) {
		fileProfil = `temp_${Date.now()}profil.png`;
		const filePath = path.join(__dirname, './uploads', username + fileProfil);
		fs.copyFileSync(path.join(__dirname, "./public/images/flamme.png"), filePath);
	} else {
		const filePath = path.join(__dirname, './uploads', username + fileProfil);
		fs.writeFileSync(filePath, parsedParts.fileBufferProfil);
	}

	if (!fileBg) {
		fileBg = `temp_${Date.now()}bg.png`;
		const filePath = path.join(__dirname, './uploads', username + fileBg);
		fs.copyFileSync(path.join(__dirname, "./public/images/profil_bg.jpeg"), filePath);
	} else {
		const filePath = path.join(__dirname, './uploads', username + fileBg);
		fs.writeFileSync(filePath, parsedParts.fileBufferBg);
	}

	const hashedPassword = await app.bcrypt.hash(password);
	await createUser(username, hashedPassword, email, twoFa, '/uploads/' + username + fileProfil, '/uploads/' + username + fileBg);
	return loginUser(req, reply, password, username);
}

export const verifFormRegister = async (req, reply) => {
	try {
		const uploadDir = path.join(__dirname, './uploads');
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		const parsedParts = await parseRequestParts(req, reply);
		if (!parsedParts.fields) return;

		const validationResult = await validateRegisterForm(req, parsedParts.fields);
		if (validationResult.message !== "ok") {
			return reply.send({ message: validationResult.message });
		}
		if (parsedParts.fields.two_factor_register != 'true') {
			return registerUser(req, reply, parsedParts, false);
		}

		const code = await generateCode(req, reply);
		const response = await sendEmail(parsedParts.fields.email, parsedParts.fields.username, code.code);
		if (response.message !== "ok") {
			return reply.send({ message: response.message });
		}
		return reply
			.setCookie("code_id", code.codeId, {
				httpOnly: true,
				secure: true,
				sameSite: "lax",
				path: "/",
				maxAge: 240,
			})
			.send({ message: "twoFa" });
	}
	catch (error) {
		return reply.send({ message: "Internal server error" });
	}
}

export const checkUserBack = async (req, reply) => {
	try {
		const uploadDir = path.join(__dirname, './uploads');
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		const parsedParts = await parseRequestParts(req, reply);
		if (!parsedParts.fields) return;

		const validationResult = await validateRegisterForm(req, parsedParts.fields);
		if (validationResult.message !== "ok") {
			return reply.send({ message: validationResult.message });
		}

		const response = await verifCode(req, reply, parsedParts.fields.verif_email);
		if (response !== "ok") {
			return reply.send({ message: response, code: true });
		}

		return registerUser(req, reply, parsedParts, true);
	} catch (error) {
		return reply.send({message: error.message});
	}
};

const validateRegisterForm = async (req, fields) => {
	const jsonLanguage = await getLanguageWithoutBody(req);

	const formResponse = verifyForm(fields.username, fields.email, fields.password, jsonLanguage);
	if (formResponse.message !== "ok") {
		return { message: formResponse.message };
	}

	const isExistResponse = await isExist(req, fields.username, fields.email);
	if (isExistResponse) {
		return { message: isExistResponse };
	}
	return { message: "ok" };
};
