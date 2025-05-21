import { app } from '../server.js';
import { updateUserDb, findUserById, updateUserGoogleDb, findUserByEmail, findUser } from '../dist/prisma/seed.js';
import path from 'path';
import fs from 'fs';
import { __dirname } from '../router.js';
import { authenticateUser } from './tokens.js';
import { verifyForm } from '../dist/srcs/middleware/verify.js';
import { verifEmail, verifCode } from './email.js';
import { parseRequestParts } from '../middleware/parseRequestParts.js';
import { getLanguageWithoutBody } from './getLanguage.js'

const verifUpdate = async (req, reply, fields) => {
	let language = req.cookies.userLanguage;
	let jsonLanguage = await getLanguageWithoutBody(language);
	const response = await authenticateUser(req);

	const user = await findUserById(response.user.id);
	if (response.status !== 200 || !user) {
		return reply.send({message : jsonLanguage.verify.notAuth});
	}

	if (fields.previousPassword === "")
		return reply.send({message : jsonLanguage.verify.prevPassword});

	const validPassword = await app.bcrypt.compare(fields.previousPassword, user.password);
	if (!validPassword)
		return reply.send({message : jsonLanguage.verify.wrongPrevPassword});

	const formResponse = verifyForm(fields.username, fields.email, fields.newPassword, jsonLanguage);
	if (formResponse.message !== "ok") {
		if (fields.newPassword === "") {
			if (!formResponse.password)
				return reply.send({message : formResponse.message});
		} else {
			return reply.send({message : formResponse.message});
		}
	}

	const isUsername = await findUser(fields.username);
	if (isUsername && fields.username !== user.username) {
		return reply.send({ message: jsonLanguage.verify.usernameAlreadyExists });
	}
	const isUserEmail = await findUserByEmail(fields.email);
	if (isUserEmail && fields.email !== user.email) {
		return reply.send({ message: jsonLanguage.verify.emailAlreadyExists });
	}
	if (fields.newPassword !== "" && fields.newPassword === fields.previousPassword)
		return reply.send({message : jsonLanguage.verify.diffPassword});
	return { response, user };
}

const handleFileUpload = async (fileName, fileBuffer, user) => {
	fileName = '/uploads/' + user.username + fileName;
	const unlinkFile = path.join(__dirname, './uploads', user.profilePicture);
	if (fs.existsSync(unlinkFile))
		fs.unlinkSync(unlinkFile);
	const filePath = path.join(__dirname, fileName);
	fs.writeFileSync(filePath, fileBuffer);
	return fileName;
}

export const updateUserTwoFA = async (req, reply) => {

	try {
		let { fields, fileBufferProfil, fileProfil, fileBufferBg, fileBg } = await parseRequestParts(req, reply);
		if (!fields) return;

		const { response, user } = await verifUpdate(req, reply, fields);
		if (!response || !user) {
			return ;
		}

		const newPassword = fields.newPassword;
		const email = fields.email;
		const username = fields.username;
		const twoFactor = fields.two_factor == "true" ? true : false;

		const responseCode = await verifCode(req, reply, fields.verif_email);
		if (responseCode !== "ok") {
			return reply.send({ message: responseCode, code: true });
		}

		if (fileProfil)
			fileProfil = await handleFileUpload(fileProfil, fileBufferProfil, user);

		if (fileBg)
			fileBg = await handleFileUpload(fileBg, fileBufferBg, user);

		let hashedPassword = "";
		if (newPassword !== "")
			hashedPassword = await app.bcrypt.hash(newPassword);

		await updateUserDb(response.user.id, username, hashedPassword, email, twoFactor, fileProfil, fileBg);
	} catch (error) {
		return reply.send({message: error.message});
	}
	return reply.send({message : "ok"});
}

export const updateUser = async (req, reply) => {

	// let { fields, fileBuffer, fileName } = await parseRequestParts(req, reply);
	let { fields, fileBufferProfil, fileProfil, fileBufferBg, fileBg } = await parseRequestParts(req, reply);
	if (!fields) return;

	const newPassword = fields.newPassword;
	const email = fields.email;
	const username = fields.username;
	const twoFactor = fields.two_factor == "true" ? true : false;

	const { response, user } = await verifUpdate(req, reply, fields);
	if (!response || !user) {
		return ;
	}

	if ((email !== user.email && twoFactor === true) || (twoFactor !== user.twoFactor && twoFactor === true)) {
		const responseVerif = await verifEmail(req, reply, email, username);
		return reply.send({ message : responseVerif, email : true});
	}

	if (fileProfil)
		fileProfil = await handleFileUpload(fileProfil, fileBufferProfil, user);
	if (fileBg)
		fileBg = await handleFileUpload(fileBg, fileBufferBg, user);

	let hashedPassword = "";
	if (newPassword !== "")
		hashedPassword = await app.bcrypt.hash(newPassword);

	try {
		await updateUserDb(response.user.id, username, hashedPassword, email, twoFactor, fileProfil, fileBg);
	} catch (error) {
		return reply.send({message: error.message});
	}
	return reply.send({message : "ok"});
};

export const updateUserGoogle = async (req, reply) => {

	let { fields, fileBufferProfil, fileProfil, fileBufferBg, fileBg } = await parseRequestParts(req, reply);
	if (!fields) return;

	const username = fields.username;

	const jsonLanguage = await getLanguageWithoutBody(req.cookies.userLanguage);

	const response = await authenticateUser(req);

	if (response.status !== 200 || !response.user.goole === 0) {
		return reply.send({message : jsonLanguage.verify.notAuth});
	}

	const user = await findUserById(response.user.id);
	if (!user) {
		return reply.send({message : jsonLanguage.verify.notAuth});
	}

	if (username.trim().length < 3 || username.trim().length > 20)
		return reply.send({message : jsonLanguage.verify.minimumLengthUser});

	if (/[^a-zA-Z0-9_]/.test(username))
		return reply.send({ message: jsonLanguage.verify.characters });

	if (fileProfil)
		fileProfil = await handleFileUpload(fileProfil, fileBufferProfil, user);
	if (fileBg)
		fileBg = await handleFileUpload(fileBg, fileBufferBg, user);
	try {
		await updateUserGoogleDb(response.user.id, username, fileProfil, fileBg);
	} catch (error) {
		return reply.send({message: error.message});
	}
	return reply.send({message : "ok"});
};
