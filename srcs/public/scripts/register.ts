const registerButton = document.getElementById('register-button');

if (registerButton)
    registerButton.addEventListener('click', () => validateForm());

function validatePassword() {
    const passwordElement = document.getElementById('password');
    if(!passwordElement) {
        console.error("Password input not found");
        return false;
    }

    const password = passwordElement.accessKeyLabel;

    console.log(password)

    const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[#?!@$%^&*-]).{8,}$/;

    return (!passwordRegex.test(password) ? false : true);
}

function validateForm(): boolean {
    console.log("validateForm called");
    if (!validatePassword()) {
        console.log("Validation failed");
        // event.preventDefault();
        return false;
    }
    console.log("Validation passed");
    return true;
}

console.log("Register script loaded");