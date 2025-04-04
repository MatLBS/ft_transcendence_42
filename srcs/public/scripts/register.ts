import { recvContent } from '../main.js';
import { applyLink } from './utils.js';

// const register_button = document.getElementById('register_button');

const appDiv = document.getElementById("app");
if (appDiv) {
	appDiv.addEventListener("click", (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		applyLink(target, e);

		if (target.tagName === "BUTTON" && target.id === "register_button") {
			validateForm()
		}
		if (target.tagName === "SPAN" && target.id === "login-eye") {
			showPassword()
		}
	});
}

function validateForm() {

	console.log("validateForm");
	const passwordElement = document.getElementById('password') as HTMLInputElement | null;
	const emailElement = document.getElementById('email') as HTMLInputElement | null;
	const usernameElement = document.getElementById('username') as HTMLInputElement | null;
	const profile_pictureElement = document.getElementById('profile_picture') as HTMLInputElement | null;
	const error_input = document.getElementById('error_input');

	const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[#?!@$%^&*-]).{8,}$/;
	const emailRegex = /[a-zA-Z0-9_.±]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;

	const password = passwordElement?.value || '';
	const email = emailElement?.value || '';
	const username = usernameElement?.value || '';
	const profile_picture = profile_pictureElement?.files?.[0];

	if ((username === '' || email === '' || password === '') && error_input) {
		error_input.innerHTML = `<p>You must fill all the options.</p>`;
		return;
	}

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

//function to change password to text 
function showPassword() {

	const input = document.getElementById('password') as HTMLInputElement | null;
	let iconEye = document.getElementById('login-eye') as HTMLInputElement | null;

	if (!input || !iconEye)
		return;

	iconEye.innerText = (iconEye.textContent === 'visibility_off') ? 'visibility' : 'visibility_off';
	input.type = (input.type === 'password') ? 'text' : 'password'
}