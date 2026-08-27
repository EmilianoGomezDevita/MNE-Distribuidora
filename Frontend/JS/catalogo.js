import { API_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('token');

    const container = document.getElementById('grid-productos');
    const template = container.querySelector('.card-producto');

    const PRODUCTOS_POR_PAGINA = 8; // subilo a 12 si preferís

    let todosLosProductos = []; // guardamos la lista completa acá
    let paginaActual = 1;

    function formatearPrecio(numero) {
        return numero.toLocaleString('es-AR');
    }

    function crearTarjeta(producto) {
        const card = template.cloneNode(true);

        card.dataset.id = producto.id;

        const img = card.querySelector('.card-img-container img');
        img.src = producto.imagen || '';
        img.alt = producto.nombre;

        const nombreEl = card.querySelector('.prod-nombre, .prod-name');
        nombreEl.textContent = producto.nombre;

        card.querySelector('.product-price').textContent =
            `$${formatearPrecio(producto.precio)} Iva Inc.`;

        const btnAgregar = card.querySelector('.btn-primary');
        btnAgregar.dataset.id = producto.id;

        return card;
    }

    // Solo dibuja los productos que corresponden a la página actual
    function renderizarPagina() {
        container.innerHTML = '';

        const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
        const fin = inicio + PRODUCTOS_POR_PAGINA;
        const productosDeEstaPagina = todosLosProductos.slice(inicio, fin);

        productosDeEstaPagina.forEach(producto => {
            container.appendChild(crearTarjeta(producto));
        });

        renderizarControlesPaginacion();
    }

    function renderizarControlesPaginacion() {
        let paginacionEl = document.getElementById('paginacion');

        // Si el HTML todavía no tiene el contenedor, lo creamos una sola vez
        if (!paginacionEl) {
            paginacionEl = document.createElement('div');
            paginacionEl.id = 'paginacion';
            paginacionEl.className = 'paginacion';
            container.insertAdjacentElement('afterend', paginacionEl);
        }

        const totalPaginas = Math.ceil(todosLosProductos.length / PRODUCTOS_POR_PAGINA);

        // Si todo entra en una sola página, no hace falta mostrar controles
        if (totalPaginas <= 1) {
            paginacionEl.innerHTML = '';
            return;
        }

        let botonesHTML = '';
        for (let i = 1; i <= totalPaginas; i++) {
            const claseActiva = i === paginaActual ? 'active' : '';
            botonesHTML += `<button class="btn-pagina ${claseActiva}" data-pagina="${i}">${i}</button>`;
        }
        paginacionEl.innerHTML = botonesHTML;
    }

    async function cargarCatalogo() {
        try {
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/api/cat/catalogo`, { headers });

            if (!res.ok) {
                throw new Error('No se pudo cargar el catálogo');
            }

            todosLosProductos = await res.json();
            paginaActual = 1;
            renderizarPagina();

        } catch (error) {
            console.error('Error al cargar el catálogo:', error);
        }
    }

    // Delegación de eventos: "Agregar al carrito" y los botones de paginación,
    // ambos escuchados desde el document (los botones de página se crean
    // fuera del contenedor original, así que delegamos más arriba).
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('btn-primary')) {
            const idProducto = event.target.dataset.id;
            console.log('Agregar al carrito, producto id:', idProducto);
        }

        if (event.target.classList.contains('btn-pagina')) {
            paginaActual = Number(event.target.dataset.pagina);
            renderizarPagina();
            window.scrollTo({ top: container.offsetTop - 100, behavior: 'smooth' });
        }
    });

    cargarCatalogo();
});