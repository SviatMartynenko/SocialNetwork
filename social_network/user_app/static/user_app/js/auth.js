function getCSRFtoken(){
    return document.querySelector("meta[name='csrf-token']").getAttribute('content');
}
console.log(getCSRFtoken());

const navigation = document.querySelector(".navigation");
navigation.style.justifyContent = "center";

const formRegister = document.querySelector(".register-div");
const formLogin = document.querySelector(".login-div");

const loginTitle = formRegister.querySelector(".register-login-text")
const registerTitle = formLogin.querySelector(".registration-text")

loginTitle.addEventListener("click", () => {
    formRegister.style.display = "none";
    formLogin.style.display = "flex";
});

registerTitle.addEventListener("click", () => {
    formLogin.style.display = "none";
    formRegister.style.display = "flex";
});

const eyes = document.querySelectorAll(".eye")

eyes.forEach(eye => {
    eye.addEventListener('click', function() {
        const container = eye.closest('.form-input-field-container');
        const passwordInput = container.querySelector('input');
        const openSrc = eye.getAttribute('eye-open-src');
        const closeSrc = eye.getAttribute('eye-close-src');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eye.src = openSrc; 
        }
        else {
            passwordInput.type = 'password';
            eye.src = closeSrc;
        }
    });
});