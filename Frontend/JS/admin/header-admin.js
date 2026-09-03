import { API_URL } from "../config.js";

document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem('token');

    // El panel entero requiere sesión de admin — sin token, ni se muestra
    if (!token) {
        window.location.href = "../crearCuenta.html";
        return;
    }

    // --- Título dinámico según la página ---
    // Cada HTML del panel define <body data-modulo="solicitudes"> (o "productos", etc.)
    // y un <title data-titulo="..."> propio — este script solo lee esos datos.
    const modulo = document.body.dataset.modulo;
    const tituloPagina = document.body.dataset.titulo || "Panel de administración";

    const headerTitle = document.getElementById('admin-header-title');
    if (headerTitle) headerTitle.textContent = tituloPagina;

    // --- Marcar el link activo en el sidebar ---
    if (modulo) {
        const linkActivo = document.querySelector(`.admin-nav-link[data-modulo="${modulo}"]`);
        if (linkActivo) linkActivo.classList.add('active');
    }

    // --- Mostrar el email del admin logueado ---
    const emailEl = document.getElementById('admin-header-user-email');
    if (emailEl) {
        try {
            const res = await fetch(`${API_URL}/api/auth/perfil`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401 || res.status === 403) {
                // token vencido, o no es admin: afuera
                localStorage.removeItem('token');
                window.location.href = "../crearCuenta.html";
                return;
            }

            if (res.ok) {
                const data = await res.json();
                emailEl.textContent = data.email;
            }
        } catch (error) {
            console.error('Error al cargar el perfil del admin:', error);
        }
    }

    // --- Cerrar sesión ---
    const btnCerrarSesion = document.getElementById('admin-btn-cerrar-sesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', function () {
            localStorage.removeItem('token');
            window.location.href = "/Frontend/index.html";
        });
    }

    // --- Toggle del sidebar en mobile ---
    const btnHamburguesa = document.getElementById('admin-btn-hamburguesa');
    const sidebar = document.getElementById('admin-sidebar');
    if (btnHamburguesa && sidebar) {
        btnHamburguesa.addEventListener('click', function () {
            sidebar.classList.toggle('active');
        });
    }
});