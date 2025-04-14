import { app } from '../server.js';
import { updateUserDb, findUserById, updateUserGoogleDb } from '../dist/prisma/seed.js';
import path from 'path';
import fs from 'fs';
import { __dirname } from '../router.js';
import { authenticateUser } from './tokens.js';
import { verifyForm } from '../dist/srcs/middleware/verify.js';

export const updateUser = async (req, reply) => {

	let fields = {};
	let fileBuffer = null, originalExtension = null, fileName = null;

	// Utiliser req.parts() pour traiter les fichiers et les champs
	const parts = req.parts();
	for await (const part of parts) {
		if (part.file) {
			if (!part.mimetype.startsWith('image/')) {
				return reply.send({ message: 'Invalid file type. Only images are allowed.' });
			}
			// Si c'est un fichier, le sauvegarder
			originalExtension = path.extname(part.filename);
			fileName = `temp_${Date.now()}${originalExtension}`;
			fileBuffer = await part.toBuffer();
		} else {
			// Si c'est un champ, l'ajouter à fields
			fields[part.fieldname] = part.value;
		}
	}

	const newPassword = fields.newPassword;
	const email = fields.email;
	const username = fields.username;
	const prePassword = fields.previousPassword;

	const response = await authenticateUser(req);

	const user = await findUserById(response.user.id);
	if (response.status !== 200 || !user) {
		return reply.send({message : "User not authenticated."});
	}

	if (prePassword === "")
		return reply.send({message : "The previous password is required."});

	const validPassword = await app.bcrypt.compare(prePassword, user.password);

	if (!validPassword)
		return reply.send({message : "The previous password is incorrect."});

	const formResponse = verifyForm(username, email, newPassword);
	if (formResponse.message !== "ok") {
		if (newPassword === "") {
			if (!formResponse.password)
				return reply.send({message : formResponse.message});
		} else {
			return reply.send({message : formResponse.message});
		}
	}

	if (newPassword !== "" && newPassword === prePassword)
		return reply.send({message : "The new password must be different from the previous one."});

	if (fileName) {
		fileName = '/uploads/' + username + fileName;
		const unlinkFile = path.join(__dirname, './uploads', user.profilePicture);
		if (fs.existsSync(unlinkFile)) fs.unlinkSync(unlinkFile);
		const filePath = path.join(__dirname, fileName);
		fs.writeFileSync(filePath, fileBuffer);
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

	let fields = {};
	let fileBuffer = null, originalExtension = null, fileName = null;

	// Utiliser req.parts() pour traiter les fichiers et les champs
	const parts = req.parts();
	for await (const part of parts) {
		if (part.file) {
			if (!part.mimetype.startsWith('image/')) {
				return reply.send({ message: 'Invalid file type. Only images are allowed.' });
			}
			// Si c'est un fichier, le sauvegarder
			originalExtension = path.extname(part.filename);
			fileName = `temp_${Date.now()}${originalExtension}`;
			fileBuffer = await part.toBuffer();
		} else {
			// Si c'est un champ, l'ajouter à fields
			fields[part.fieldname] = part.value;
		}
	}
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
		fileName = '/uploads/' + username + fileName;
		const unlinkFile = path.join(__dirname, './uploads', user.profilePicture);
		if (fs.existsSync(unlinkFile)) fs.unlinkSync(unlinkFile);
		const filePath = path.join(__dirname, fileName);
		fs.writeFileSync(filePath, fileBuffer);
	}

	try {
		await updateUserGoogleDb(response.user.id, username, fileName);
	} catch (error) {
		return reply.send({message: error.message});
	}
	return reply.send({message : "ok"});
};
