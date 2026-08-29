document.addEventListener('DOMContentLoaded', function () {
    const btnBurguer = document.getElementById('btn-hamburguesa');
    const mainNav = document.getElementById('main-nav')

    if (btnBurguer && mainNav) {
        btnBurguer.addEventListener("click", function () {
            mainNav.classList.toggle("active")
        })
    }
    const token = localStorage.getItem('token');
    const linksInvitado = document.querySelectorAll('.header-actions .link-plain:not(#header-perfil-link), .header-actions .btn-outline');
    const linkPerfil = document.getElementById('header-perfil-link');

    if (token) {
        linksInvitado.forEach(link => link.style.display = 'none');
        if (linkPerfil) linkPerfil.style.display = 'inline-flex';
    }
})