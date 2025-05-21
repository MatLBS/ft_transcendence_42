/**
 * Checks the validity of user registration form fields.
 *
 * @param username - The username to validate. Must be non-empty, contain only alphanumeric characters or underscores, and be between 3 and 20 characters long.
 * @param email - The email address to validate. Must be non-empty and match the standard email format.
 * @param password - The password to validate. Must be non-empty and meet security criteria (at least 8 characters, one uppercase letter, one lowercase letter, one special character).
 * @param jsonLanguage - An object containing localized error messages to return if validation fails.
 * @returns An object containing a localized error message if validation fails, or `{ message: "ok" }` if all validations pass.
 *
 */
export function verifyForm(username: string, email: string, password: string, jsonLanguage: any) {
	const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[#?!@$%^&*-]).{8,}$/;
	const emailRegex = /[a-zA-Z0-9_.±]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;

	if (username.trim() === '') {
		return { message: jsonLanguage.verify.username };
	}

	if (!/^[\p{L}\p{N} '-]+$/u.test(username)) {
		return { message: jsonLanguage.verify.characters };
	}

	if (email.trim() === '') {
		return { message: jsonLanguage.verify.regexEmail };
	}

	if (username.length < 3 || username.length > 20) {
		return { message: jsonLanguage.verify.minimumLengthUser };
	}

	if (email && !emailRegex.test(email)) {
		return { message: jsonLanguage.verify.invalidEmail };
	}

	if (password === '') {
		return { message: jsonLanguage.verify.password, password: true };
	}

	if (password && !passwordRegex.test(password)) {
		return { message: jsonLanguage.verify.regexPassword, password: true };
	}

	return { message: "ok" };
}
