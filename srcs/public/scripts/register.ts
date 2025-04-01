import { error } from "console";

const passwordElement = document.getElementById('password') as HTMLInputElement | null;
const emailElement = document.getElementById('email') as HTMLInputElement | null;
const usernameElement = document.getElementById('username') as HTMLInputElement | null;
const error_input = document.getElementById('error_input');
const register_button = document.getElementById('register_button');

register_button?.addEventListener('click', (event) => {validateForm(event)});

function validateForm(event: Event) {
	const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[#?!@$%^&*-]).{8,}$/;
	const emailRegex = /[a-zA-Z0-9_.±]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;

	const password = passwordElement?.value || '';
	const email = emailElement?.value || '';
	const username = usernameElement?.value || '';

	if (password && !passwordRegex.test(password) && error_input) {
		error_input.innerHTML = `<p>Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character.</p>`;
		return;
	}

	if (email && !emailRegex.test(email) && error_input) {
		error_input.innerHTML = `<p>The email is not valide.</p>`;
		return;
	}

	fetch('/registerUser', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, email, password }),
	})
	.then(async (response) => {
		const data = await response.json();
		if (data.message === "ok")
			window.location.href = "/";
		else if (error_input)
			error_input.innerHTML = `<p>` + data.message + `</p>`;
	})
}
