import { app } from '../server.js';
import { createUser } from '../dist/prisma/seed.js';
import { loginUser } from './loginUser.js';
import path from 'path';
import fs from 'fs';
import { __dirname } from '../router.js';
import { verifyForm } from '../dist/srcs/middleware/verify.js';

export const checkUserBack = async (req, reply) => {

	let fields = {};
	let fileBuffer = null, originalExtension = null, fileName = null;

	// Utiliser req.parts() pour traiter les fichiers et les champs
	const uploadDir = path.join(__dirname, './uploads');
	if (!fs.existsSync(uploadDir)) {
		fs.mkdirSync(uploadDir, { recursive: true });
	}
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

	const password = fields.password;
	const email = fields.email;
	const username = fields.username;

	const formResponse = verifyForm(username, email, password);
	if (formResponse.message !== "ok") {
		return reply.send({message : formResponse.message});
	}

	if (!fileName) {
		fileName = `temp_${Date.now()}.png`;
		const filePath = path.join(__dirname, './uploads', username + fileName);
		fs.copyFileSync(path.join(__dirname, "./public/images/flamme.png"), filePath);
	} else {
		const filePath = path.join(__dirname, './uploads', username + fileName);
		fs.writeFileSync(filePath, fileBuffer);
	}

	const hashedPassword = await app.bcrypt.hash(password);
	try {
		await createUser(username, hashedPassword, email, '/uploads/' + username + fileName);
		// await updateSiteLanguage("en");
	} catch (error) {
		return reply.send({message: error.message});
	}
	return loginUser(req, reply, password, username);
};
