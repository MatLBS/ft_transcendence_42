import { errorInput, navigateTo } from '../main.js';
import { getInputValue } from './utils.js';
import { verifyForm } from '../../middleware/verify.js';
import { language } from '../main.js';


// const register_button = document.getElementById('register_button');

const appDiv = document.getElementById("app");
if (appDiv) {
	appDiv.addEventListener("click", (e: MouseEvent) => {
		const target = e.target as HTMLElement;

		if (target.tagName === "BUTTON" && target.id === "confirm_button") {
			validateForm()
		}
		if (target.tagName === "INPUT" && target.id === "profile_picture") {
			previewImage("preview_image_profil", "profile_picture")
		}
		if (target.tagName === "INPUT" && target.id === "bg_picture") {
			previewImage("preview_image_bg", "bg_picture")
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
		if (target.tagName === "SPAN" && target.id === "upload_icon_profil") {
			const fileInput = document.getElementById('profile_picture');
			if (fileInput)
				fileInput.click();
		}
		if (target.tagName === "SPAN" && target.id === "upload_icon_bg") {
			const fileInput = document.getElementById('bg_picture');
			if (fileInput)
				fileInput.click();
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
	const bg_pictureElement = document.getElementById('bg_picture') as HTMLInputElement | null;
	const bg_picture = bg_pictureElement?.files?.[0];

	const two_factor = document.getElementById('two_factor_register') as HTMLInputElement | null;

	if (!error_input || !error_mail)
		return;

	const formData = new FormData();
	formData.append('username', username);
	formData.append('email', email);
	formData.append('password', password);

	if (two_factor && two_factor.checked) {
		formData.append('two_factor_register', 'true');
	} else {
		formData.append('two_factor_register', 'false');
	}

	if (profile_picture)
		formData.append('profile_picture', profile_picture);
	if (bg_picture)
		formData.append('bg_picture', bg_picture);
	formData.append('verif_email', verif_email);

	fetch('/registerUser', {
		method: 'POST',
		body: formData,
	})
	.then(async (response) => {
		const data = await response.json();
		if (data.message !== "ok") {
			if (data.code === true) {
				error_mail.textContent = data.message;
			} else {
				const modal = document.getElementById('modal');
				if (modal && !modal.classList.contains('hidden'))
					modal.classList.add('hidden');
				errorInput(data.message);
			}
			return;
		} else {
			navigateTo('/profil');
		}
	})
	.catch((error) => {
		console.error("Network error:", error);
		errorInput(`Erreur réseau. Veuillez réessayer plus tard.`);
	});
}

async function validateForm() {
	const error_input = document.getElementById('error_input');
	const password = getInputValue('password');
	const email = getInputValue('email');
	const username = getInputValue('username');
	const two_factor = document.getElementById('two_factor_register') as HTMLInputElement | null;

	const profile_pictureElement = document.getElementById('profile_picture') as HTMLInputElement | null;
	const profile_picture = profile_pictureElement?.files?.[0];

	const bg_pictureElement = document.getElementById('bg_picture') as HTMLInputElement | null;
	const bg_picture = bg_pictureElement?.files?.[0];

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
	const formResponse = verifyForm(username, email, password, jsonLanguage);
	if (formResponse.message !== "ok") {
		return errorInput(formResponse.message);
	}

	const formData = new FormData();
	formData.append('username', username);
	formData.append('email', email);
	formData.append('password', password);

	if (two_factor && two_factor.checked) {
		formData.append('two_factor_register', 'true');
	} else {
		formData.append('two_factor_register', 'false');
	}

	if (profile_picture)
		formData.append('profile_picture', profile_picture);
	if (bg_picture)
		formData.append('bg_picture', bg_picture);

	await fetch('/verifForm', {
		method: 'POST',
		body: formData,
	})
	.then(async (response) => {
		const data = await response.json();
		if (data.message !== "ok" && data.message !== "twoFa") {
			return errorInput(data.message);
		}
		else if (data.message === "twoFa") {
			const modal = document.getElementById('modal');
			if (modal) {
				modal.classList.remove('hidden');
				const modalButton = document.getElementById('modal_button');
				if (modalButton)
					modalButton.id = 'register_button';
			}
		}
		else {
			const modal = document.getElementById('modal');
			if (modal && !modal.classList.contains('hidden'))
				modal.classList.add('hidden');
			navigateTo('/profil');
		}
	})
	.catch((error) => {
		console.error("Network error:", error);
		errorInput(`Erreur réseau. Veuillez réessayer plus tard.`);
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

function previewImage(idPreview: string, idInput: string) {
	const profile_picture = document.getElementById(idInput);
	if (profile_picture) {
		profile_picture.addEventListener('change', function (event) {
			const target = event.target as HTMLInputElement | null;
			if (!target || !target.files) return;
			const file = target.files[0];
			const reader = new FileReader();

			reader.onload = function (e) {
				const imagePreview = document.getElementById(idPreview);
				if (!imagePreview) return;
				(imagePreview as HTMLImageElement).src = e?.target?.result as string;
			};

			if (file) {
				reader.readAsDataURL(file);
			}
		});
	}
}
