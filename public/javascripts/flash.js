// This function makes a flash message disappear after 3 seconds
setTimeout(function() {
    const alert = document.querySelector('.alert');
    alert.classList.add('fade-out');
    alert.addEventListener('transitionend', function() {
        alert.remove();
    });
}, 3000);