import { app } from '../server.js';
import { updateUserDb, findUserById, updateUserGoogleDb, findUserByEmail, findUser } from '../dist/prisma/seed.js';
import path from 'path';
import fs from 'fs';
import { __dirname } from '../router.js';
import { authenticateUser } from './tokens.js';
import { verifyForm } from '../dist/srcs/middleware/verify.js';
import { verifEmail, verifCode } from './email.js';
import { parseRequestParts } from '../middleware/parseRequestParts.js';

const verifUpdate = async (req, reply, fields) => {
	const response = await authenticateUser(req);

	const user = await findUserById(response.user.id);
	if (response.status !== 200 || !user) {
		return reply.send({message : "User not authenticated."});
	}

	if (fields.previousPassword === "")
		return reply.send({message : "The previous password is required."});

	const validPassword = await app.bcrypt.compare(fields.previousPassword, user.password);
	if (!validPassword)
		return reply.send({message : "The previous password is incorrect."});

	const formResponse = verifyForm(fields.username, fields.email, fields.newPassword, "");
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
		return reply.send({ message: "This username already exists." });
	}
	const isUserEmail = await findUserByEmail(fields.email);
	if (isUserEmail && fields.email !== user.email) {
		return reply.send({ message: "This email already exists." });
	}
	if (fields.newPassword !== "" && fields.newPassword === fields.previousPassword)
		return reply.send({message : "The new password must be different from the previous one."});
	return { response, user };
}

const handleFileUpload = async (fileName, fileBuffer, user) => {
	fileName = '/uploads/' + user.username + fileName;
	const unlinkFile = path.join(__dirname, './uploads', user.profilePicture);
	if (fs.existsSync(unlinkFile)) fs.unlinkSync(unlinkFile);
	const filePath = path.join(__dirname, fileName);
	fs.writeFileSync(filePath, fileBuffer);
	return fileName;
}

export const updateUserTwoFA = async (req, reply) => {

	try {
		let { fields, fileBuffer, fileName } = await parseRequestParts(req, reply);
		if (!fields) return;

		const { response, user } = await verifUpdate(req, reply, fields);
		if (!response || !user) {
			return ;
		}

		const newPassword = fields.newPassword;
		const email = fields.email;
		const username = fields.username;

		const responseCode = await verifCode(req, reply, fields.verif_email);
		if (responseCode !== "ok") {
			return reply.send({ message: responseCode, code: true });
		}

		if (fileName) {
			fileName = await handleFileUpload(fileName, fileBuffer, user);
		}

		let hashedPassword = "";
		if (newPassword !== "")
			hashedPassword = await app.bcrypt.hash(newPassword);

		await updateUserDb(response.user.id, username, hashedPassword, email, fileName);
	} catch (error) {
		return reply.send({message: error.message});
	}
	return reply.send({message : "ok"});
}

export const updateUser = async (req, reply) => {

	let { fields, fileBuffer, fileName } = await parseRequestParts(req, reply);
	if (!fields) return;

	const newPassword = fields.newPassword;
	const email = fields.email;
	const username = fields.username;

	const { response, user } = await verifUpdate(req, reply, fields);
	if (!response || !user) {
		return ;
	}

	if (email !== user.email) {
		const responseVerif = await verifEmail(req, reply, email, username);
		return reply.send({ message : responseVerif, email : true});
	}

	if (fileName) {
		fileName = await handleFileUpload(fileName, fileBuffer, user);
	}

	let hashedPassword = "";
	if (newPassword !== "")
		hashedPassword = await app.bcrypt.hash(newPassword);

	try {
		await updateUserDb(response.user.id, username, hashedPassword, email, fileName);
	} catch (error) {
		return reply.send({message: error.message});
	}
	return reply.send({message : "ok"});
};

export const updateUserGoogle = async (req, reply) => {

	let { fields, fileBuffer, fileName } = await parseRequestParts(req, reply);
	if (!fields) return;

	const username = fields.username;

	const response = await authenticateUser(req);

	if (response.status !== 200 || !response.user.goole === 0) {
		return reply.send({message : "User not authenticated."});
	}

	const user = await findUserById(response.user.id);
	if (!user) {
		return reply.send({message : "User not authenticated."});
	}

	if (username.length < 3 || username.length > 20)
		return reply.send({message : "The username must be between 3 and 20 characters."});

	if (fileName) {
		fileName = await handleFileUpload(fileName, fileBuffer, user);
	}

	try {
		await updateUserGoogleDb(response.user.id, username, fileName);
	} catch (error) {
		return reply.send({message: error.message});
	}
	return reply.send({message : "ok"});
};
