export async function validatePassword(password) {
    console.log('validatePassword');

    // Regex pour vérifier la complexité du mot de passe
    var passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[#?!@$%^&*-]).{8,}$/;

    return (!passwordRegex.test(password) ? false : true);
}