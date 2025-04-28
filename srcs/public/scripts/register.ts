import { recvContent } from '../main.js';
import { applyLink, getInputValue } from './utils.js';
import { verifyForm } from '../../middleware/verify.js';
import { language } from '../main.js';


// const register_button = document.getElementById('register_button');

const appDiv = document.getElementById("app");
if (appDiv) {
	appDiv.addEventListener("click", (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		applyLink(target, e);

		if (target.tagName === "BUTTON" && target.id === "confirm_button") {
			validateForm()
		}
		if (target.tagName === "INPUT" && target.id === "profile_picture") {
			previewImage()
		}
		if (target.tagName === "SPAN" && target.id === "register-eye") {
			showPassword()
		}
		if (target.tagName === "BUTTON" && target.id === "register_button_google") {
			googleLogin();
		}
		if (target.tagName === "BUTTON" && target.id === "register_button") {
			registerUser();
		}
		if (target.tagName === "SPAN" && target.id === "close-modal") {
			const modal = document.getElementById('modal');
			if (modal)
				modal.classList.add('hidden');
		}
	});
}

function googleLogin() {
	const error_input = document.getElementById('error_input');
	if (!error_input)
		return;

	window.location.href = "/auth/google";
}

function registerUser() {
	const error_input = document.getElementById('error_input');
	const error_mail = document.getElementById('error_mail');

	const password = getInputValue('password');
	const email = getInputValue('email');
	const username = getInputValue('username');
	const verif_email = getInputValue('verif_email');

	const profile_pictureElement = document.getElementById('profile_picture') as HTMLInputElement | null;
	const profile_picture = profile_pictureElement?.files?.[0];

	if (!error_input || !error_mail)
		return;

	const formData = new FormData();
	formData.append('username', username);
	formData.append('email', email);
	formData.append('password', password);
	if (profile_picture) {
		formData.append('profile_picture', profile_picture);
	}
	formData.append('verif_email', verif_email);
	fetch('/registerUser', {
		method: 'POST',
		body: formData,
	})
	.then(async (response) => {
		const data = await response.json();
		if (data.message !== "ok") {
			if (data.code === true) {
				error_mail.innerHTML = data.message;
			} else {
				const modal = document.getElementById('modal');
				if (modal && !modal.classList.contains('hidden'))
					modal.classList.add('hidden');
				error_input.innerHTML = `<p>` + data.message + `</p>`;
			}
			return;
		} else {
			recvContent('/profil');
		}
	})
	.catch((error) => {
		console.error("Network error:", error);
		error_input.innerHTML = `<p>Erreur réseau. Veuillez réessayer plus tard.</p>`;
	});
}

async function validateForm() {
	const error_input = document.getElementById('error_input');
	const password = getInputValue('password');
	const email = getInputValue('email');
	const username = getInputValue('username');

	const profile_pictureElement = document.getElementById('profile_picture') as HTMLInputElement | null;
	const profile_picture = profile_pictureElement?.files?.[0];

	if (!error_input)
		return;

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
	const formResponse = await verifyForm(username, email, password, jsonLanguage);
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
	await fetch('/verifForm', {
		method: 'POST',
		body: formData,
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
					modalButton.id = 'register_button';
			}
		}
	})
	.catch((error) => {
		console.error("Network error:", error);
		error_input.innerHTML = `<p>Erreur réseau. Veuillez réessayer plus tard.</p>`;
	});
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

function previewImage() {
	const profile_picture = document.getElementById('profile_picture');
	if (profile_picture) {
		profile_picture.addEventListener('change', function (event) {
			const target = event.target as HTMLInputElement | null;
			if (!target || !target.files) return;
			const file = target.files[0];
			const reader = new FileReader();

			reader.onload = function (e) {
				const imagePreview = document.getElementById('preview_image');
				if (!imagePreview) return;
				(imagePreview as HTMLImageElement).src = e?.target?.result as string;
			};

			if (file) {
				reader.readAsDataURL(file);
			}
		});
	}
}
