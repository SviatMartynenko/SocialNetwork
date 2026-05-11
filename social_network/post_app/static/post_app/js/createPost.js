const createPostBtn = document.querySelector(".Go-to-design");
const modalOverlay = document.querySelector(".modal-overlay");
const cross = document.getElementById('close-modal');
const selectImage = document.getElementById('id_images');
const tagsField = document.getElementById('id_tags');
const tagsLabels = tagsField.querySelectorAll('label');
const previewContainer = document.querySelector('.loaded-images');


let plusImgDiv = document.createElement('div');
plusImgDiv.classList.add('plus-img-div');

let plus = document.createElement('img');
plus.classList.add('img-cover');
plus.src = '/static/post_app/images/plus.svg';

plusImgDiv.appendChild(plus); 
tagsField.appendChild(plusImgDiv);



createPostBtn.addEventListener("click", () => {
    modalOverlay.style.display = "flex";
    document.querySelector('body').style.overflowY = 'hidden';
});
cross.addEventListener("click", () => {
    modalOverlay.style.display = "none";
    document.querySelector('body').style.overflowY = 'scroll';
});

function getCSRFToken(){
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content')
}



tagsLabels.forEach(label => {
    label.addEventListener(
        'click', 
        function (){
            if (label.querySelector('input').checked){
                label.style.backgroundColor = 'rgba(84, 60, 82, 1)';
            }
            else{
                label.style.backgroundColor = 'rgba(233, 229, 238, 1)';
            }
        }
    );
});

document.getElementById('add-link').addEventListener(
    'click',
    function (){
        const input =  document.createElement('input');
        input.type = 'url';
        input.name = 'links';
        input.placeholder = 'https://www.instagram.com/world.it.academy';

        document.getElementById('links-list').appendChild(document.createElement('br'));
        document.getElementById('links-list').appendChild(input);
    }
)
document.getElementById('add-img').addEventListener('click', () => selectImage.click());

selectImage.addEventListener(
    'change', 
    function() {
        const files = Array.from(this.files);

        files.forEach(file => {
            const reader = new FileReader();

            reader.onload = function(e) {
                const div = document.createElement('div');
                div.className = 'image-card'; // Добавьте стили как на скрипте (скругление, размер)
                div.style.position = 'relative';

                div.innerHTML = `
                    <img src="${e.target.result}" style="width: 150px; height: 150px; object-fit: cover; border-radius: 15px;">`;

                
                previewContainer.appendChild(div);
            };

            reader.readAsDataURL(file);
        });
    });

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
