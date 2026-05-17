const createPostBtn = document.querySelector(".Go-to-design");
const modalOverlay = document.querySelector(".modal-overlay");
const cross = document.getElementById('close-modal');
const selectImage = document.getElementById('id_images');
const tagsField = document.getElementById('id_tags');
const previewContainer = document.querySelector('.loaded-images');
const closeTagModal = document.getElementById('closeTagModal');
let selectedFiles = [];


let plusImgDiv = document.createElement('div');
plusImgDiv.classList.add('plus-img-div');

let plus = document.createElement('img');
plus.classList.add('img-cover');
plus.src = '/static/post_app/images/plus.svg';
plus.id = "add-tag"

plusImgDiv.appendChild(plus); 
tagsField.appendChild(plusImgDiv);

closeTagModal.addEventListener(
    "click",
    function(){
        this.closest('.add-tag-container').style.display = 'none';
        document.querySelector(".create-post-container").style.display = "flex";
    }
);

createPostBtn.addEventListener("click", () => {
   const preparedTextContent = document.getElementById('postContent').value;
    document.getElementById('contentField').value = preparedTextContent;
    console.log(preparedTextContent);
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



document.getElementById('id_tags').querySelectorAll('label').forEach(
    label => {
        label.addEventListener(
            'click', 
            function (){
                if (label.querySelector('input').checked){
                    label.style.backgroundColor = 'rgba(84, 60, 82, 1)';
                    label.style.color = 'rgba(233, 229, 238, 1)';
                }
                else{
                    label.style.backgroundColor = 'rgba(233, 229, 238, 1)';
                    label.style.color = 'rgba(84, 60, 82, 1)';
                }
            }
        );
});

document.getElementById('add-tag').addEventListener(
    'click',
    function (){
        document.querySelector('.add-tag-container').style.display = "flex";
        document.querySelector(".create-post-container").style.display = "none";
    }
)


function addNewRow() {
    const div = document.createElement('div');
    div.classList.add('link-row');

    div.innerHTML = `
        <input type="url" name="links" placeholder="https://www.instagram.com/world.it.academy">
                    <div class="add-link" id="add-link">
                        <img class = "plus-link" src="/static/post_app/images/plus.svg" alt="">
                    </div>
                    <div class="remove-link" id="remove-link">
                        <img class = "cross-link" src="/static/post_app/images/cross.svg" alt="">
                    </div>
    `;
    
    document.getElementById('links-list').appendChild(div);
}

document.getElementById('links-list').addEventListener('click', function(event) {

    if (event.target && event.target.classList.contains('plus-link')) {
        addNewRow();
    }
    
    if (event.target && event.target.classList.contains('cross-link')) {
        event.target.closest('.link-row').remove();
    }
});


document.getElementById('add-img').addEventListener('click', () => selectImage.click());

selectImage.addEventListener(
    'change', 
    function() {
        const files = Array.from(this.files);

        
        files.forEach(file => {

            const reader = new FileReader();

            reader.onload = function(event) {
                const div = document.createElement('div');
                div.className = 'image-card'; 
                div.setAttribute('data-filename', file.name); 
                div.style.position = 'relative';

                div.innerHTML = `
                    <div class = "trash-image-container">
                        <img class = "img-cover" src = "/static/post_app/images/delete-image.svg">
                    </div>
                    <img src="${event.target.result}" style="width: 150px; height: 150px; object-fit: cover; border-radius: 15px;">
                    `;
                previewContainer.appendChild(div);
            };

            reader.readAsDataURL(file);
        });
    });

previewContainer.addEventListener('click', function(event) {
    const deleteImageBtn = event.target.closest('.trash-image-container');
    if (deleteImageBtn) {
        const card = deleteImageBtn.closest('.image-card');

        const fileNameToRemove = card.getAttribute('data-filename');
        
        const fileInput = document.getElementById('id_images');
            const dt = new DataTransfer();
            
            Array.from(fileInput.files).forEach((file) => {
                if (file.name !== fileNameToRemove) {
                    dt.items.add(file);
                }
            });
            fileInput.files = dt.files;
        
        card.remove();
    }
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

document.querySelector('.add-tag-container').addEventListener(
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
            const tagsList = document.getElementById('id_tags');
            const div = document.createElement('div');
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.value = data.id;
            label.textContent = `#${data.name}`;
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
            label.appendChild(input);
            div.appendChild(label);
            tagsList.insertBefore(div, tagsList.querySelector('.plus-img-div'));
            this.querySelector('input').value = '';
            this.style.display = 'none';
            document.querySelector(".create-post-container").style.display = "flex";
        })
        .catch(data => {
            if(data.errors){
                console.log(data.errors)
            }
        })
    }
)
