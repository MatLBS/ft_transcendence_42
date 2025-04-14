import { app } from '../server.js';
import { createUser } from '../dist/prisma/seed.js';
import { loginUser } from './loginUser.js';
import path from 'path';
import fs from 'fs';
import { __dirname } from '../router.js';
import { verifyForm } from '../dist/srcs/middleware/verify.js';
import { sendEmail, generateCode, verifCode } from './email.js';

export const verifFormRegister = async (req, reply) => {
	const parts = req.parts();
	let fields = {};
	for await (const part of parts) {
		if (part.file) {
			if (!part.mimetype.startsWith('image/')) {
				return reply.send({ message: 'Invalid file type. Only images are allowed.' });
			}
		}
		else
			fields[part.fieldname] = part.value;
	}
	const email = fields.email;
	const username = fields.username;

	const formResponse = verifyForm(username, email, fields.password);
	if (formResponse.message !== "ok") {
		return reply.send({ message: formResponse.message });
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

export const checkUserBack = async (req, reply) => {

	let fields = {};
	let fileBuffer = null, fileName = null;

	try {
		// Utiliser req.parts() pour traiter les fichiers et les champs
		const uploadDir = path.join(__dirname, './uploads');
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		const parts = req.parts();
		for await (const part of parts) {
			if (part.file) {
				const originalExtension = path.extname(part.filename);
				fileName = `temp_${Date.now()}${originalExtension}`;
				fileBuffer = await part.toBuffer();
			} else {
				// Si c'est un champ, l'ajouter à fields
				fields[part.fieldname] = part.value;
			}
		}

		const response = await verifCode(req, reply, fields.verif_email);
		if (response !== "ok") {
			return reply.send({ message: response, code: true });
		}

		const password = fields.password;
		const username = fields.username;

		if (!fileName) {
			fileName = `temp_${Date.now()}.png`;
			const filePath = path.join(__dirname, './uploads', username + fileName);
			fs.copyFileSync(path.join(__dirname, "./public/images/flamme.png"), filePath);
		} else {
			const filePath = path.join(__dirname, './uploads', username + fileName);
			fs.writeFileSync(filePath, fileBuffer);
		}

		const hashedPassword = await app.bcrypt.hash(password);
		await createUser(username, hashedPassword, fields.email, '/uploads/' + username + fileName); // faire verif sur le nom d'utilisateur et l'email avant verifFormRegister
		return loginUser(req, reply, password, username);
	} catch (error) {
		return reply.send({message: error.message});
	}
};
