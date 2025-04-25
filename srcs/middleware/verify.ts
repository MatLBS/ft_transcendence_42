import { json } from "stream/consumers";

export async function verifyForm(username: string, email: string, password: string, language: string) {
	let jsonLanguage;
	await fetch('/languages', {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ language }),
	})
		.then(async (response) => {
			jsonLanguage = await response.json();
		})
		.catch((error: unknown) => {
			console.error('Erreur lors de la récupération du contenu:', error);
		});
	console.log(jsonLanguage);
		
	const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[#?!@$%^&*-]).{8,}$/;
	const emailRegex = /[a-zA-Z0-9_.±]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;

	if (username.trim() === '') {
		return { message: jsonLanguage!.verify.username };
	}

	if (email.trim() === '') {
		return { message: jsonLanguage!.verify.regexEmail };
	}

	if (username.length < 3 || username.length > 20) {
		return { message: jsonLanguage!.verify.minimumLengthUser };
	}

	if (email && !emailRegex.test(email)) {
		return { message: jsonLanguage!.verify.invalidEmail };
	}

	if (password === '') {
		return { message: jsonLanguage!.verify.password, password: true };
	}

	if (password && !passwordRegex.test(password)) {
		return { message: jsonLanguage!.verify.regexPassword, password: true };
	}

	return { message: "ok" };
}
