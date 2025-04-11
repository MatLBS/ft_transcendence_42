export function verifyForm(username: string, email: string, password: string) {
	const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[#?!@$%^&*-]).{8,}$/;
	const emailRegex = /[a-zA-Z0-9_.±]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;

	if (username === '') {
		return { message: "Username is required." };
	}

	if (email === '') {
		return { message: "Email is required." };
	}

	if (username.length < 3 || username.length > 20) {
		return { message: "Username must be between 3 and 20 characters long." };
	}

	if (email && !emailRegex.test(email)) {
		return { message: "The email is not valid." };
	}

	if (password === '') {
		return { message: "Password is required.", password: true };
	}

	if (password && !passwordRegex.test(password)) {
		return { message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character.", password: true };
	}

	return { message: "ok" };
}
