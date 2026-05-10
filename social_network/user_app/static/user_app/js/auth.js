function getCSRFtoken(){
    return document.querySelector("meta[name='csrf-token']").getAttribute('content');
}

const navigation = document.querySelector(".navigation");
navigation.style.justifyContent = "center";
const content = document.querySelector('.content');
content.style.justifyContent = 'center';

const formRegister = document.querySelector(".register-div");
const formLogin = document.querySelector(".login-div");
const formConfirmEmail = document.querySelector(".confirm-email-div")

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

window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tab') === 'login') {
        formRegister.style.display = "none";
        formLogin.style.display = "flex";
    }
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

document.querySelector(".confirm-email-form-back-btn").addEventListener("click", () => {
    formRegister.style.display = "flex";
    formConfirmEmail.style.display = "none";
});

document.querySelector(".register-form").addEventListener(
    "submit",
    (event) => {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);

        const password = formData.get('password1')
        
    if (password.length < 8) {
        document.querySelector('.register-password-error').innerText = 'Пароль занадто короткий (потрібно від 8 символів)';
        return;
    }

    if (!/[0-9]/.test(password)) { 
        document.querySelector('.register-password-error').innerText = 'Додайте хоча б одну цифру';
        return;
    }

    if (password.toLowerCase() === password.toUpperCase()) {
        document.querySelector('.register-password-error').innerText = 'Додайте хоча б одну букву';
        return;
    } 
      
    fetch(form.action, {
        method: "POST", 
        headers: {
            'X-CSRFToken': getCSRFtoken(),
            "X-Requested-With": "XMLHttpRequest"
        },
        body: formData  
        })
        .then(async (response) => {
            const data = await response.json()
            if (!response.ok){
                throw data;    
            }
            return data
        })   
        .then((data)=>{
            console.log("Користувач успішно створений")
            const email = document.getElementById('entered-email');
            email.textContent = data.email;
            formRegister.style.display = "none";
            formConfirmEmail.style.display = "flex";
            document.querySelectorAll('input[type="password"]').forEach(input => input.value = '');
        })
        .catch((data)=>{
            if(data.errors){
                if("email" in data.errors){
                document.querySelector('.register-email-error').innerText = data.errors.email[0].message;
                }
                else{
                    document.querySelector('.register-email-error').innerText = '';
                }
                if("__all__" in data.errors){
                    document.querySelector('.register-password-error').innerText = data.errors.__all__[0].message;
                }
                else{
                    document.querySelector('.register-password-error').innerText = '';
                }
                console.log(data.errors)
            }
        })
}
        

)

document.querySelector(".login-form").addEventListener(
"submit",
(event) => {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);

    fetch(form.action, {
        method: "POST", 
        headers: {
            'X-CSRFToken': getCSRFtoken(),
            "X-Requested-With": "XMLHttpRequest"
        },
        body: formData  
    })
        .then(async (response) => {
            const data = await response.json()
            if (!response.ok){
                throw data;    
            }
            return data
        })   
        .then((data)=>{
            console.log("Користувач успішно увійшов")
            document.querySelectorAll('input[type="password"]').forEach(input => input.value = '');
            window.location.replace(data.redirect_url);
        })
        .catch((data)=>{
            if(data.errors){
                if("__all__" in data.errors){
                document.querySelector('.login-error-mesage').innerText = data.errors.__all__[0].message;
                }
                else{
                    document.querySelector('.login-error-mesage').innerText = ''; 
                }
                console.log(data.errors);
            }
        })
}
)

document.querySelector(".confirm-email-form").addEventListener(
"submit",
(event) => {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);

    fetch(form.action, {
        method: "POST", 
        headers: {
            'X-CSRFToken': getCSRFtoken(),
            "X-Requested-With": "XMLHttpRequest"
        },
        body: formData  
    })
        .then(async (response) => {
            const data = await response.json()
            if (!response.ok){
                throw data;    
            }
            return data
        })   
        .then((data)=>{
            window.location.replace(data.redirect_url);
            console.log("Пошту підтверджено")
        })
        .catch((data)=>{
            if(data.errors){
                if(typeof val === 'object' && val !== null && !Array.isArray(val) && "__all__" in data.errors){
                document.querySelector('.confirm-email-error-mesage').innerText = data.errors.__all__[0].message;
                }
                else{
                    document.querySelector('.confirm-email-error-mesage').innerText = data.errors; 
                }
                console.log(data.errors)
            }
        })
    }
)
