document.addEventListener('DOMContentLoaded', function () {
    const btnBurguer = document.getElementById('btn-hamburguesa');
    const mainNav = document.getElementById('main-nav');

    if (btnBurguer && mainNav) {
        btnBurguer.addEventListener("click", function () {
            mainNav.classList.toggle("active");
        });
    }

    // --- Chequeo real de validez del token, leyendo su expiración del propio JWT ---
    function tokenValido(token) {
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiraEnMs = payload.exp * 1000; // "exp" viene en segundos, lo pasamos a ms
            return Date.now() < expiraEnMs;
        } catch {
            return false; // token corrupto o mal formado: lo tratamos como inválido
        }
    }

    const tokenGuardado = localStorage.getItem('token');
    const sesionActiva = tokenValido(tokenGuardado);

    // Si había un token pero ya venció, lo limpiamos para no arrastrarlo
    if (tokenGuardado && !sesionActiva) {
        localStorage.removeItem('token');
    }

    const linksInvitado = document.querySelectorAll('.header-actions .link-plain, .header-actions .btn-outline');
    const perfilDropdown = document.getElementById('header-perfil-dropdown');
    const perfilToggle = document.getElementById('perfil-dropdown-toggle');
    const perfilMenu = document.getElementById('perfil-dropdown-menu');
    const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');

    if (sesionActiva) {
        linksInvitado.forEach(link => link.style.display = 'none');
        if (perfilDropdown) perfilDropdown.style.display = 'inline-flex';
    }
    // si no hay sesión activa, el header queda con su estado por defecto (links de invitado visibles)

    if (perfilToggle && perfilMenu) {
        perfilToggle.addEventListener('click', function (event) {
            event.stopPropagation();
            perfilMenu.classList.toggle('hidden');
        });

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
});