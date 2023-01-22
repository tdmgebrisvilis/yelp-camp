setTimeout(function() {
    const alert = document.querySelector('.alert');
    alert.classList.add('fade-out');
    alert.addEventListener('transitionend', function() {
        alert.remove();
    });
}, 3000);