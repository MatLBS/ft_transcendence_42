import { recvContent } from '../main.js';

const passwordElement = document.getElementById('password') as HTMLInputElement | null;
const emailElement = document.getElementById('email') as HTMLInputElement | null;
const usernameElement = document.getElementById('username') as HTMLInputElement | null;
const profile_pictureElement = document.getElementById('profile_picture') as HTMLInputElement | null;
const error_input = document.getElementById('error_input');
const register_button = document.getElementById('register_button');

register_button?.addEventListener('click', () => {validateForm()});

function validateForm() {
	const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[#?!@$%^&*-]).{8,}$/;
	const emailRegex = /[a-zA-Z0-9_.±]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;

	const password = passwordElement?.value || '';
	const email = emailElement?.value || '';
	const username = usernameElement?.value || '';
	const profile_picture = profile_pictureElement?.files?.[0];

	if (password && !passwordRegex.test(password) && error_input) {
		error_input.innerHTML = `<p>Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character.</p>`;
		return;
	}

	if (email && !emailRegex.test(email) && error_input) {
		error_input.innerHTML = `<p>The email is not valide.</p>`;
		return;
	}

	const formData = new FormData();
	formData.append('username', username);
	formData.append('email', email);
	formData.append('password', password);
	if (profile_picture) {
		formData.append('profile_picture', profile_picture); // Ajouter le fichier
	}

	fetch('/registerUser', {
		method: 'POST',
		body: formData,
	})
	.then(async (response) => {
		const data = await response.json();
		if (data.message === "ok") {
			recvContent("/");
			history.pushState(null, '', '/');
		} else if (error_input) {
			error_input.innerHTML = `<p>` + data.message + `</p>`;
		}
	})
}
