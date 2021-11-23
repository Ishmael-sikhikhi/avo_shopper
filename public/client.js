document.addEventListener('DOMContentLoaded', function () {
    let errorMessageElem = document.querySelector('.error');
    if (errorMessageElem.innerHTML !== '') {
        setTimeout(() => {
            errorMessageElem.innerHTML = '';
            
        }, 3000);
    }

});