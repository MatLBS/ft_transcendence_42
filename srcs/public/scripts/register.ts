import { recvContent } from '../main.js';
import { applyLink, getInputValue } from './utils.js';
import { verifyForm } from '../../middleware/verify.js';

// const register_button = document.getElementById('register_button');

const appDiv = document.getElementById("app");
if (appDiv) {
	appDiv.addEventListener("click", (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		applyLink(target, e);

		if (target.tagName === "BUTTON" && target.id === "register_button") {
			validateForm()
		}
		if (target.tagName === "SPAN" && target.id === "register-eye") {
			showPassword()
		}
	});
}

function validateForm() {
	const error_input = document.getElementById('error_input');
	const password = getInputValue('password');
	const email = getInputValue('email');
	const username = getInputValue('username');

	const profile_pictureElement = document.getElementById('profile_picture') as HTMLInputElement | null;
	const profile_picture = profile_pictureElement?.files?.[0];

	if (!error_input)
		return;

	const formResponse = verifyForm(username, email, password);
	if (formResponse.message !== "ok") {
		error_input.innerHTML = `<p>` + formResponse.message + `</p>`;
		return;
	}

	const formData = new FormData();
	formData.append('username', username);
	formData.append('email', email);
	formData.append('password', password);
	if (profile_picture) {
		formData.append('profile_picture', profile_picture);
	}

	fetch('/registerUser', {
		method: 'POST',
		body: formData,
	})
	.then(async (response) => {
		const data = await response.json();
		if (data.message === "ok") {
			recvContent("/");
		} else if (error_input) {
			error_input.innerHTML = `<p>` + data.message + `</p>`;
		}
	})
}

//function to change password to text
function showPassword() {

	const input = document.getElementById('password') as HTMLInputElement | null;
	let iconEye = document.getElementById('register-eye') as HTMLInputElement | null;

	if (!input || !iconEye)
		return;

	iconEye.innerText = (iconEye.textContent === 'visibility_off') ? 'visibility' : 'visibility_off';
	input.type = (input.type === 'password') ? 'text' : 'password'
}
