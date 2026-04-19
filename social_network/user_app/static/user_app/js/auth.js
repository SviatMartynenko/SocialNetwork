function getCSRFtoken(){
    return document.querySelector("meta[name='csrf-token']").getAttribute('content')
}
console.log(getCSRFtoken())