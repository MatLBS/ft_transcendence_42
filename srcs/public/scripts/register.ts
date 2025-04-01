const passwordElement = document.getElementById('password') as HTMLInputElement | null;
const emailElement = document.getElementById('email') as HTMLInputElement | null;
const usernameElement = document.getElementById('username') as HTMLInputElement | null;
const error_input = document.getElementById('error_input');
const register_button = document.getElementById('register_button');

register_button?.addEventListener('click', (event) => {validateForm(event)});

function validateForm(event: Event) {
    const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[#?!@$%^&*-]).{8,}$/;
    const password = passwordElement?.value || '';
    const email = emailElement?.value || '';
    const username = usernameElement?.value || '';

    if (password && !passwordRegex.test(password) && error_input) {
        event.preventDefault();
        error_input.remove();
        error_input.innerHTML += "<p>Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character.</p>"
        return;
    }
    fetch('/registerUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
    })
    .then(async (response) => {
        const data = await response.json();
        console.error(data.message);
        if (data.message !== "" && error_input) { 
            console.log("ici1")
            event.preventDefault();
            error_input.remove();
            error_input.innerHTML += "<p>An user already exists</p>"
            return;
        }
        console.log("ici")
    })
}