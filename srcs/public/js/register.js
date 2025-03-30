
function validatePassword() {
    const passwordInput = document.getElementById('password');
    const password = passwordInput.value;

    // Regex pour vérifier la complexité du mot de passe
    var passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[#?!@$%^&*-]).{8,}$/;

    if (!passwordRegex.test(password))
        return done(false, { message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one special character.' });
    else 
        return true;
}

function validateForm(event) {
    console.log('validateForm');
    if (!validatePassword()) {
        event.preventDefault(); // Empêche l'envoi du formulaire si le mot de passe est invalide
    }
}