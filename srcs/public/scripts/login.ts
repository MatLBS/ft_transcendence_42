import { recvContent } from '../main.js';
import { applyLink, getInputValue } from './utils.js';
import { language } from '../main.js';

// const login_button = document.getElementById('login_button');

/// Fonction pour gérer les clics sur les liens dynamiques
/// @param target - L'élément cible du clic
/// @param e - L'événement de clic
/// @returns void
const appDiv = document.getElementById("app");
if (appDiv) {
	appDiv.addEventListener("click", (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		applyLink(target, e);

		if (target.tagName === "BUTTON" && target.id === "login_button") {
			Login()
		}
		if (target.tagName === "SPAN" && target.id === "login-eye") {
			showPassword()
		}
		if (target.tagName === "BUTTON" && target.id === "login_button_google") {
			googleLogin();
		}
		if (target.tagName === "BUTTON" && target.id === "confirm_login") {
			validateForm();
		}
		if (target.tagName === "SPAN" && target.id === "close-modal") {
			const modal = document.getElementById('modal');
			if (modal)
				modal.classList.add('hidden');
		}
	});
}

async function validateForm() {
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
	const error_input = document.getElementById('error_input');
	if (!error_input)
		return;

	const password = getInputValue('password');
	const username = getInputValue('username');

	if (username === "") {
		error_input.innerHTML = `<p>${jsonLanguage!.login.usernameRequired}</p>`;
		return;
	}
	if (password === "") {
		error_input.innerHTML = `<p>${jsonLanguage!.login.passwordRequired}</p>`;
		return;
	}
	fetch('/verifLogin', {
		method: 'POST',
		body: JSON.stringify({ username, password }),
	})
	.then(async (response) => {
		const data = await response.json();
		if (data.message !== "ok") {
			error_input.innerHTML = `<p>` + data.message + `</p>`;
			return;
		} else {
			const modal = document.getElementById('modal');
			if (modal) {
				modal.classList.remove('hidden');
				const modalButton = document.getElementById('modal_button');
				if (modalButton)
					modalButton.id = 'login_button';
			}
		}
	})
}

function googleLogin() {
	const error_input = document.getElementById('error_input');
	if (!error_input)
		return;

	window.location.href = "/auth/google";
}

function Login() {
	const error_input = document.getElementById('error_input');
	const error_mail = document.getElementById('error_mail');

	const password = getInputValue('password');
	const username = getInputValue('username');
	const verif_email = getInputValue('verif_email');

	if (!error_input || !error_mail)
		return;

	fetch('/login', {
		method: 'POST',
		body: JSON.stringify({ username, password, verif_email }),
	})
	.then(async (response) => {
		const data = await response.json();
		if (data.message === "ok") {
			recvContent("/profil");
		} else {
			if (data.code === true) {
				error_mail.innerHTML = data.message;
			} else {
				const modal = document.getElementById('modal');
				if (modal && !modal.classList.contains('hidden'))
					modal.classList.add('hidden');
				error_input.innerHTML = `<p>` + data.message + `</p>`;
			}
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
