import nodemailer from 'nodemailer';
import crypto from "crypto";

export const generateCode = async (req, reply) => {
	if (!global.codeId) {
		global.codeId = new Map();
	}
	const code = "123456";//Math.floor(100000 + Math.random() * 900000).toString(); // le code que le user doit donner
	const codeId = crypto.randomUUID();
	global.codeId.set(codeId, {
		code,
		timestamp: Date.now(),
	});
	return {code, codeId};
}

export const verifCode = async (req, reply, verifEmail) => {
	const codeId = req.cookies.code_id;
	if (!codeId) {
		return "Code ID missing";
	}
	const code = global.codeId.get(codeId);
	if (!code || !code.code) {
		return "Code expired";
	}
	if (code.code !== verifEmail) {
		return "Code incorrect";
	}
	return "ok";
}

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL,
		pass: process.env.CODE_EMAIL,
	}
});

export const sendEmail = async (email, username, code) => {
	const text = `Bonjour ${username},\n\nMerci de vous être inscrit sur notre site. Veuillez entrez le code de vérification suivant :\n\n${code}\n\nCordialement,\nL'équipe de notre site.`;
	const mailOptions = {
		from: 'mig95sim@gmail.com',
		to: email,
		subject: 'Vérification de l\'email',
		text: text,
	};
	try {
		// const info = await transporter.sendMail(mailOptions);
		return { message: 'ok'};
	} catch (error) {
		return { message: 'Error sending email', error };
	}
}
