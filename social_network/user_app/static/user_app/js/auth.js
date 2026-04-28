function getCSRFtoken(){
    return document.querySelector("meta[name='csrf-token']").getAttribute('content');
}
console.log(getCSRFtoken());

const navigation = document.querySelector(".navigation");
navigation.style.justifyContent = "center";

const formRegister = document.querySelector(".register-div");
const formLogin = document.querySelector(".login-div");
const formConfirmEmail = document.querySelector(".confirm-email-div")

const loginTitle = formRegister.querySelector(".register-login-text")
const registerTitle = formLogin.querySelector(".registration-text")

window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tab') === 'login') {
        formRegister.style.display = "none";
        formLogin.style.display = "flex";
    }
});

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

document.querySelector('.register-button').addEventListener("click", () => {
    formRegister.style.display = "none";
    formConfirmEmail.style.display = "flex";
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

        fetch(form.action, {
            method: "POST", 
            headers: {
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
            })
            .catch((data)=>{
                if(data.errors){
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
            window.location.replace(data.redirect_url);
        })
        .catch((data)=>{
            if(data.errors){
                console.log(data.errors)
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
                console.log(data.errors)
            }
        })
        
}
)