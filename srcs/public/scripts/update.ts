import { recvContent } from '../main.js';
import { applyLink, getInputValue } from './utils.js';
import { verifyForm } from '../../middleware/verify.js';

// const register_button = document.getElementById('register_button');

const appDiv = document.getElementById("app");
if (appDiv) {
	appDiv.addEventListener("click", (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		applyLink(target, e);

		if (target.tagName === "BUTTON" && target.id === "update_button") {
			validateForm()
		}
		if (target.tagName === "INPUT" && target.id === "profile_picture") {
			previewImage()
		}
		if (target.tagName === "SPAN" && (target.id === "new_password_eye" || target.id === "prev_password_eye")) {
			showPassword(target.id)
		}
	});
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

// register_button?.addEventListener('click', () => {validateForm()});

function validateForm() {
	const error_input = document.getElementById('error_input');
	const previousPassword = getInputValue('prev_password');
	let newPassword = getInputValue('new_password');
	const email = getInputValue('email');
	const username = getInputValue('username');

	if (!error_input)
		return;

	const profile_pictureElement = document.getElementById('profile_picture') as HTMLInputElement | null;
	const profile_picture = profile_pictureElement?.files?.[0];

	const formResponse = verifyForm(username, email, newPassword);
	if (formResponse.message !== "ok") {
		error_input.innerHTML = `<p>` + formResponse.message + `</p>`;
		return;
	}

	const formData = new FormData();
	formData.append('username', username);
	formData.append('email', email);
	formData.append('previousPassword', previousPassword);
	formData.append('newPassword', newPassword);
	if (profile_picture) {
		formData.append('profile_picture', profile_picture);
	}

	fetch('/updateUser', {
		method: 'POST',
		credentials: 'include',
		body: formData,
	})
	.then(async (response) => {
		const data = await response.json();
		if (data.message === "ok") {
			recvContent("/profil");
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
