const API_BASE = "http://localhost:5201/api";

const PRODUCTS_URL  = `${API_BASE}/products`;
const USERS_URL     = `${API_BASE}/users`;
const PURCHASES_URL = `${API_BASE}/purchases`;

function showErrors(errors) {
    const nameError = errors.Name || errors.name;
    const priceError = errors.Price || errors.price;
    const loginError = errors.Login || errors.login;
    const emailError = errors.Email || errors.email;
    const passError = errors.Password || errors.password;

    if (nameError) showError('nazwa', nameError[0]);
    if (priceError) showError('cena', priceError[0]);
    if (loginError) showError('login', loginError[0]);
    if (emailError) showError('email', emailError[0]);
    if (passError) showError('haslo', passError[0]);
}

function showError(fieldId, msg) {
    const errorField = document.getElementById('error-' + fieldId);
    if(errorField) errorField.innerText = msg;
    
    const input = document.getElementById(fieldId);
    if(input) {
        input.style.borderColor = "red";
        input.style.backgroundColor = "#fff0f0";
    }
}

function clearErrors() {
    document.querySelectorAll('.error-msg').forEach(el => el.innerText = "");
    document.querySelectorAll('.formularz-pole').forEach(el => {
        el.style.borderColor = "#dddcdc";
        el.style.backgroundColor = "white";
    });
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}