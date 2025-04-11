import { app } from '../server.js';
import { createUser } from '../dist/prisma/seed.js';
import { loginUser } from './loginUser.js';
import path from 'path';
import fs from 'fs';
import { __dirname } from '../router.js';
import { verifyForm } from '../dist/srcs/middleware/verify.js';
import { sendEmail } from './email.js';
import crypto from "crypto";

export const verifFormRegister = async (req, reply) => {
	const parts = req.parts();
	let fields = {};
	for await (const part of parts) {
		fields[part.fieldname] = part.value;
	}

	const password = fields.password;
	const email = fields.email;
	const username = fields.username;

	const formResponse = verifyForm(username, email, password);
	if (formResponse.message !== "ok") {
		return reply.send({ message: formResponse.message });
	}

	if (!global.codeId) {
		global.codeId = new Map();
	}
	const code = "123456"//Math.floor(100000 + Math.random() * 900000).toString(); // le code que le user doit donner
	const codeId = crypto.randomUUID();
	global.codeId.set(codeId, {
		code,
		timestamp: Date.now(),
	});

	reply.setCookie("code_id", codeId, {
		httpOnly: true,
		secure: false,
		sameSite: "lax",
		path: "/",
		maxAge: 90,
	});

	const response = await sendEmail(email, username, code);
	if (response.message !== "ok") {
		return reply.send({ message: response.message });
	}
	return reply.send({ message: "ok" });
}

export const checkUserBack = async (req, reply) => {

	let fields = {};
	let fileBuffer = null, originalExtension = null, fileName = null;

	try {
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
				originalExtension = path.extname(part.filename);
				fileName = `temp_${Date.now()}${originalExtension}`;
				fileBuffer = await part.toBuffer();
			} else {
				// Si c'est un champ, l'ajouter à fields
				fields[part.fieldname] = part.value;
			}
		}

		const codeId = req.cookies.code_id;
		const code = global.codeId.get(codeId);
		global.codeId.delete(codeId);

		const password = fields.password;
		const username = fields.username;
		const verifCode = fields.verif_email;

		console.log("code = ", code.code);
		console.log("verifCode = ", verifCode);

		if (!code || !code.code) {
			return reply.send({ message: "Code expired" });
		}
		if (code.code !== verifCode) {
			return reply.send({ message: "Code incorrect" });
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
		await createUser(username, hashedPassword, fields.email, '/uploads/' + username + fileName); // faire verif sur le nom d'utilisateur et l'email avant verifFormRegister
		return loginUser(req, reply, password, username);
	} catch (error) {
		return reply.send({message: error.message});
	}
};
