function getCSRFtoken(){
    return document.querySelector("meta[name='csrf-token']").getAttribute('content')
}
console.log(getCSRFtoken())

const navigation = document.querySelector(".navigation");
navigation.style.justifyContent = "center";

