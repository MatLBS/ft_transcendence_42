import { navigateTo } from '../main.js';
import { getInputValue } from './utils.js';
import { verifyForm } from '../../middleware/verify.js';
import { language } from '../main.js';

// const register_button = document.getElementById('register_button');

const appDiv = document.getElementById("app");
if (appDiv) {
	appDiv.addEventListener("click", (e: MouseEvent) => {
		const target = e.target as HTMLElement;

		if (target.tagName === "BUTTON" && target.id === "update_button") {
			validateForm()
		}
		if (target.tagName === "INPUT" && target.id === "profile_picture") {
			previewImage("preview_image_profil", "profile_picture")
		}
		if (target.tagName === "INPUT" && target.id === "bg_picture") {
			previewImage("preview_image_bg", "bg_picture")
		}
		if (target.tagName === "SPAN" && (target.id === "new_password_eye" || target.id === "prev_password_eye")) {
			showPassword(target.id)
		}
		if (target.tagName === "BUTTON" && target.id === "update_button_google") {
			validateFormGoogle();
		}
		if (target.tagName === "BUTTON" && target.id === "modal_button") {
			updateWithEmail();
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

function appendFormData(username: string, email: string, previousPassword: string, newPassword: string, two_factor: string, profile_picture?: File, bg_picture?: File): FormData {
	const formData = new FormData();
	formData.append('username', username);
	formData.append('email', email);
	formData.append('previousPassword', previousPassword);
	formData.append('newPassword', newPassword);

	if (profile_picture) {
		formData.append('profile_picture', profile_picture);
	}
	if (bg_picture) {
		formData.append('bg_picture', bg_picture);
	}
	formData.append('two_factor', two_factor);
	return formData;
}

function updateWithEmail() {
	const error_input = document.getElementById('error_input');
	const error_mail = document.getElementById('error_mail');
	if (!error_input || !error_mail)
		return;

	const previousPassword = getInputValue('prev_password');
	const newPassword = getInputValue('new_password');
	const email = getInputValue('email');
	const username = getInputValue('username');
	const verif_email = getInputValue('verif_email');
	const profile_pictureElement = document.getElementById('profile_picture') as HTMLInputElement | null;
	const profile_picture = profile_pictureElement?.files?.[0];
	const bg_pictureElement = document.getElementById('bg_picture') as HTMLInputElement | null;
	const bg_picture = bg_pictureElement?.files?.[0];
	const two_factor = document.getElementById('two_factor_update') as HTMLInputElement | null;
	const two_fa = two_factor?.checked ? 'true' : 'false';

	const formData = appendFormData(username, email, previousPassword, newPassword, two_fa, profile_picture, bg_picture);
	formData.append('verif_email', verif_email);

	fetch('/updateTwoFA', {
		method: 'POST',
		credentials: 'include',
		body: formData,
	})
	.then(async (response) => {
		const data = await response.json();
		if (data.message === "ok") {
			navigateTo("/profil");
		} else {
			error_mail.innerHTML = data.message;
		}
	})
}

async function validateForm() {
	const error_input = document.getElementById('error_input');
	const previousPassword = getInputValue('prev_password');
	const newPassword = getInputValue('new_password');
	const email = getInputValue('email');
	const username = getInputValue('username');
	const two_factor = document.getElementById('two_factor_update') as HTMLInputElement | null;

	if (!error_input)
		return;

	const profile_pictureElement = document.getElementById('profile_picture') as HTMLInputElement | null;
	const profile_picture = profile_pictureElement?.files?.[0];
	const bg_pictureElement = document.getElementById('bg_picture') as HTMLInputElement | null;
	const bg_picture = bg_pictureElement?.files?.[0];

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

	const formResponse = verifyForm(username, email, newPassword, jsonLanguage);
	if (formResponse.message !== "ok" && !formResponse.password) {
		error_input.innerHTML = `<p>` + formResponse.message + `</p>`;
		return;
	}

	const two_fa = two_factor?.checked ? 'true' : 'false';

	const formData = appendFormData(username, email, previousPassword, newPassword, two_fa, profile_picture, bg_picture);
	fetch('/updateUser', {
		method: 'POST',
		credentials: 'include',
		body: formData,
	})
	.then(async (response) => {
		const data = await response.json();
		if (data.message === "ok") {
			navigateTo("/profil");
		} else {
			if (data.email) {
				const modal = document.getElementById('modal');
				if (modal)
					modal.classList.remove('hidden');
			} else {
				error_input.innerHTML = `<p>` + data.message + `</p>`;
			}
		}
	})
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

function validateFormGoogle() {
	const error_input = document.getElementById('error_input');
	if (!error_input)
		return;

	const username = getInputValue('username');
	const profile_pictureElement = document.getElementById('profile_picture') as HTMLInputElement | null;
	const profile_picture = profile_pictureElement?.files?.[0];
	const bg_pictureElement = document.getElementById('bg_picture') as HTMLInputElement | null;
	const bg_picture = bg_pictureElement?.files?.[0];

	const formData = new FormData();
	formData.append('username', username);
	if (profile_picture) {
		formData.append('profile_picture', profile_picture);
	}
	if (bg_picture)
		formData.append('bg_picture', bg_picture);

	fetch('/updateUserGoogle', {
		method: 'POST',
		credentials: 'include',
		body: formData,
	})
	.then(async (response) => {
		const data = await response.json();
		if (data.message === "ok") {
			navigateTo("/profil");
		} else {
			error_input.innerHTML = `<p>` + data.message + `</p>`;
		}
	})
}

//function to change password to text
function showPassword(eye_id: string) {

	const input = eye_id === "prev_password_eye" ? document.getElementById('prev_password') as HTMLInputElement | null : document.getElementById('new_password') as HTMLInputElement | null;
	let iconEye = document.getElementById(eye_id) as HTMLInputElement | null;

	if (!input || !iconEye)
		return;

	iconEye.innerText = (iconEye.textContent === 'visibility_off') ? 'visibility' : 'visibility_off';

	input.type = (input.type === 'password') ? 'text' : 'password'
}
