const passwordElement = document.getElementById('password') as HTMLInputElement | null;
const usernameElement = document.getElementById('username') as HTMLInputElement | null;
const error_input = document.getElementById('error_input');
const login_button = document.getElementById('login_button');

login_button?.addEventListener('click', () => {validateLogin()});


function validateLogin() {

	const password = passwordElement?.value || '';
	const username = usernameElement?.value || '';

	fetch('/loginUser', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password }),
	})
	.then(async (response) => {
		const data = await response.json();
		if (data.message === "ok")
			window.location.href = "/";
		else if (error_input)
			error_input.innerHTML = `<p>` + data.message + `</p>`;
	})
}
