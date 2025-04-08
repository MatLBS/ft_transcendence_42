import { recvContent } from '../main.js';
import { applyLink } from './utils.js';

// const register_button = document.getElementById('register_button');

const appDiv = document.getElementById("app");
if (appDiv) {
	appDiv.addEventListener("click", (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		applyLink(target, e);
		if (target.tagName === "BUTTON" && target.id === "update_button") {
			validateForm()
		}
	});
}

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

// register_button?.addEventListener('click', () => {validateForm()});

function validateForm() {
	console.log("validateForm");

	const previousPasswordElement = document.getElementById('pre_password') as HTMLInputElement | null;
	const newPasswordElement = document.getElementById('new_password') as HTMLInputElement | null;
	const emailElement = document.getElementById('email') as HTMLInputElement | null;
	const usernameElement = document.getElementById('username') as HTMLInputElement | null;
	const profile_pictureElement = document.getElementById('profile_picture') as HTMLInputElement | null;
	const error_input = document.getElementById('error_input');

	const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[#?!@$%^&*-]).{8,}$/;
	const emailRegex = /[a-zA-Z0-9_.±]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;

	const previousPassword = previousPasswordElement?.value || '';
	const newPassword = newPasswordElement?.value || '';
	const email = emailElement?.value || '';
	const username = usernameElement?.value || '';
	const profile_picture = profile_pictureElement?.files?.[0];

	if ((username === '' || email === '' || previousPassword === '') && error_input) {
		error_input.innerHTML = `<p>You must fill all the options.</p>`; // a changer
		return;
	}

	if (newPassword && !passwordRegex.test(newPassword) && error_input) {
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
			history.pushState(null, '', '/profil');
		} else if (error_input) {
			error_input.innerHTML = `<p>` + data.message + `</p>`;
		}
	})
}
