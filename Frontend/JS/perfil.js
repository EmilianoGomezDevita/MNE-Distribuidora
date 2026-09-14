import { API_URL } from './config.js';

document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem('token')
    if(token === null){
         window.location.href = "./crearCuenta.html";
         return;
    }

    // Referencias a elementos del Header y Sidebar
    const loginLinks = document.querySelectorAll('.header-actions .desktop-only');
    const perfilDropdown = document.getElementById('header-perfil-dropdown');
    const dropdownToggle = document.getElementById('perfil-dropdown-toggle');
    const dropdownMenu = document.getElementById('perfil-dropdown-menu');
    const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
    const sidebarBtnCerrarSesion = document.getElementById('sidebar-btn-cerrar-sesion');

    //api/auth/perfil
    fetch(`${API_URL}/api/auth/perfil`, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`
        },
    })
    .then(res => {
        if(!res.ok){
            localStorage.removeItem('token')
            window.location.href = "./crearCuenta.html";
            throw new Error("Token vencido o inválido");
        }
        return res.json()

    }) 
    .then(data => {
        document.getElementById('nombre').textContent =   data.nombre
        document.getElementById('apellido').textContent = data.apellido
        document.getElementById('email').textContent = data.email
        document.getElementById('tipoCuenta').textContent = data.tipoCuenta

        //ACTUALIZAR HEADER: Ocultar enlaces de login/registro y mostrar el icono/dropdown de perfil
        loginLinks.forEach(link => link.style.display = 'none');
        if(perfilDropdown){
            perfilDropdown.style.display = 'block'
        }
    })
    .catch(error => {
        console.error("Error al consultar el perfil", error);
    })

    //Control de despliegue del menú de usuario en el header
    if(dropdownToggle && dropdownMenu){
        dropdownToggle.addEventListener('click', function(e){
            e.stopPropagation();
            dropdownMenu.classList.toggle('hidden')
        })

        document.addEventListener('click', function(){
            dropdownMenu.classList.add('hidden')
        })
    }

    //Función y listeners para cerrar sesión (Sidebar y Header)
    function cerrarSesion(){
        localStorage.removeItem('token');
        window.location.href = "../index.html";
    }

    if(btnCerrarSesion) btnCerrarSesion.addEventListener('click', cerrarSesion);
    if(sidebarBtnCerrarSesion) sidebarBtnCerrarSesion.addEventListener('click', cerrarSesion)
})