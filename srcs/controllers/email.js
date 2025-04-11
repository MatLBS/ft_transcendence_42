import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'mig95sim@gmail.com',
		pass: 'jtxz wrii detr gwrs'
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
