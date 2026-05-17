function getCSRFtoken(){
    return document.querySelector("meta[name='csrf-token']").getAttribute('content');
}

const modalOverlay = document.querySelector(".modal-overlay");
modalOverlay.querySelector('.create-post-container').style.display = 'none';
modalOverlay.querySelector('.add-tag-container').style.display = 'none';

window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tab') === 'first_login') {
        modalOverlay.style.display = "flex";
        modalOverlay.querySelector('.first-login-container').style.display = "flex";
    }
    else{
       modalOverlay.style.display = "none"; 
       modalOverlay.querySelector('.first-login-container').style.display = "none";
       modalOverlay.querySelector('.create-post-container').style.display = 'flex';
    }
});

document.querySelector(".first-login-form").addEventListener(
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
                console.log("Інформацію додано успішно")
                window.location.replace(data.redirect_url);
            })
            .catch((data)=>{
                if(data.errors){
                    if("username" in data.errors){
                        document.querySelector('.username-error-mesage').innerText = data.errors.username[0].message;
                    }
                    else{
                        document.querySelector('.username-error-mesage').innerText = ''; 
                    }
                    console.log(data.errors)
                }
            })
    }
)