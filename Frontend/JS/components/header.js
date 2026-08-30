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
    const perfilDropdown = document.getElementById('header-perfil-dropdown');
    const perfilToggle = document.getElementById('perfil-dropdown-toggle');
    const perfilMenu = document.getElementById('perfil-dropdown-menu');
    const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');

    if (token) {
        linksInvitado.forEach(link => link.style.display = 'none');
        if (perfilDropdown) perfilDropdown.style.display = 'inline-flex';
    }

    if (perfilToggle && perfilMenu) {
        perfilToggle.addEventListener('click', function (event) {
            event.stopPropagation(); // evita que este mismo click dispare el listener del document de abajo
            perfilMenu.classList.toggle('hidden');
        });

        // Cerrar el menú si se hace click en cualquier otro lugar de la página
        document.addEventListener('click', function () {
            perfilMenu.classList.add('hidden');
        });
    }

    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', function () {
            localStorage.removeItem('token');
            window.location.href = "/Frontend/index.html";
        });
    }

})