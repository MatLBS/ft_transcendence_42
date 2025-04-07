import { app } from '../server.js';
import { createUser } from '../dist/prisma/seed.js';
import { loginUser } from './loginUser.js';
import path from 'path';
import fs from 'fs';
import { __dirname } from '../router.js';

export const checkUserBack = async (req, reply) => {

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
			const uploadDir = path.join(__dirname, './uploads');
			if (!fs.existsSync(uploadDir)) {
				fs.mkdirSync(uploadDir, { recursive: true });
			}

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
	const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[#?!@$%^&*-]).{8,}$/;
	const emailRegex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;

	if (!passwordRegex.test(password))
		return reply.send({message : "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character."});

	if (!emailRegex.test(email))
		return reply.send({message : "The email is not valid."});

	if (!username)
		return reply.send({message : "Username is required."});

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
		await createUser(username, hashedPassword, email, username + fileName);
	} catch (error) {
		return reply.send({message: error.message});
	}
	return loginUser(req, reply, password, username);
};
