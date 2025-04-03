import { recvContent } from '../main.js';
import { applyLink } from './utils.js';

// const login_button = document.getElementById('login_button');

const appDiv = document.getElementById("app");
if (appDiv) {
	appDiv.addEventListener("click", (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		applyLink(target, e);
		if (target.tagName === "BUTTON" && target.id === "login_button") {
			validateLogin()
		}
	});
}

// login_button?.addEventListener('click', () => {validateLogin()});


function validateLogin() {
	const error_input = document.getElementById('error_input');
	const passwordElement = document.getElementById('password') as HTMLInputElement | null;
	const usernameElement = document.getElementById('username') as HTMLInputElement | null;

	const password = passwordElement?.value || '';
	const username = usernameElement?.value || '';

	fetch('/loginUser', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password }),
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
