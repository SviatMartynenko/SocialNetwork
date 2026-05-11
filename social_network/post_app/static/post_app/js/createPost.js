const createPostBtn = document.querySelector(".Go-to-design")
const modalOverlay = document.querySelector(".modal-overlay")
const cross = document.getElementById('close-modal')
const selectImage = document.getElementById('id_images')

createPostBtn.addEventListener("click", () => {
    modalOverlay.style.display = "flex";
});
cross.addEventListener("click", () => {
    modalOverlay.style.display = "none";
});

function getCSRFToken(){
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content')
}

document.getElementById('add-link').addEventListener(
    'click',
    function (){
        const input =  document.createElement('input')
        input.type = 'url'
        input.name = 'links'
        input.placeholder = 'https://www.instagram.com/world.it.academy'

        document.getElementById('links-list').appendChild(document.createElement('br'))
        document.getElementById('links-list').appendChild(input)
    }
)
document.getElementById('add-img').addEventListener(
    'click',
    function (){
        selectImage.click()
    }
)

document.querySelector('.create-post-form').addEventListener(
    'submit',
    function (event){
        event.preventDefault()
        const form = event.target;
        const formData = new FormData(form);

        fetch(form.action, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: formData
        })
        .then(async response => {
            const data = await response.json()
            if (!response.ok) {
                throw data
            }
            return data
        })
        .then(data => {
           
         window.location.href = data.redirect_url;
        })
        .catch(data => {
            if(data.errors){
                console.log(data.errors)
            }
        })
    }
)
