import { API_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('token');

    const container = document.getElementById('grid-productos');
    const template = container.querySelector('.card-producto');
    const loadTxt = document.getElementById('load-txt')
    const barraBuscar = document.getElementById('input-search')

    const PRODUCTOS_POR_PAGINA = 8;

    let todosLosProductos = [];
    let productosFiltrados = [];
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
        if (nombreEl) nombreEl.textContent = producto.nombre;

        const precioEl = card.querySelector('.product-price');
        if (precioEl) precioEl.textContent = `$${formatearPrecio(producto.precio)} Iva Inc.`;

        const btnAgregar = card.querySelector('.btn-primary');
        if (btnAgregar) btnAgregar.dataset.id = producto.id;

        //hacemos que la tarjeta sea clickeable, salvo el botón de agregar
        card.style.cursor = 'pointer';
        card.addEventListener('click', function (event) {
            if (event.target.closest('btn-primary')) return; // el botón maneja su propio click
            window.location.href = `./producto.html?id=${producto.id}`
        });

        return card;
    }

    function renderizarPagina() {
        container.innerHTML = '';

        const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
        const fin = inicio + PRODUCTOS_POR_PAGINA;
        const productosDeEstaPagina = productosFiltrados.slice(inicio, fin);

        productosDeEstaPagina.forEach(producto => {
            container.appendChild(crearTarjeta(producto));
        });

        renderizarControlesPaginacion();
    }

    function renderizarControlesPaginacion() {
        let paginacionEl = document.getElementById('paginacion');

        if (!paginacionEl) {
            paginacionEl = document.createElement('div');
            paginacionEl.id = 'paginacion';
            paginacionEl.className = 'paginacion';
            container.insertAdjacentElement('afterend', paginacionEl);
        }

        const totalPaginas = Math.ceil(productosFiltrados.length / PRODUCTOS_POR_PAGINA);
        

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

    function aplicarFiltro() {
        const txt = barraBuscar.value.toLowerCase().trim()

        if (txt === '') {
            productosFiltrados = [...todosLosProductos]
        }

        else {
            productosFiltrados = todosLosProductos.filter(producto => {
                return producto.nombre.toLowerCase().includes(txt)
            })
        }
        paginaActual = 1; //vuelve a la pag 1 luego ed buscar
        renderizarPagina();
    }

    if (barraBuscar) {
        barraBuscar.addEventListener('input', aplicarFiltro)
    }


    async function cargarCatalogo() {
        if (loadTxt) loadTxt.style.display = 'block'
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
            productosFiltrados = [...todosLosProductos]
            paginaActual = 1;
            if (loadTxt) loadTxt.style.display = 'none'
            renderizarPagina();

        } catch (error) {
            console.error('Error al cargar el catálogo:', error);
            if (loadTxt) {
                loadTxt.textContent = 'No se pudo cargar el catalogo. Intente de nuevo mas tarde'
                loadTxt.style.display = 'block'
            }
        }
    }



    async function agregarProdAlCarrito(idProducto) {
        const toast = document.getElementById("toast");
        if (!token) {
            // Reemplazo de alerta simple
            Swal.fire({
                title: 'Atención',
                text: 'Debés iniciar sesión primero.',
                icon: 'warning',
                confirmButtonText: 'Ir a Iniciar Sesión',
                confirmButtonColor: '#1A1A1A' // Podés usar variables de tu CSS
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = "./crearCuenta.html";
                }
            });
            return;
        }
        try {
            // La ruta real vive bajo /api/usuario, no /api/carrito
            const res = await fetch(`${API_URL}/api/usuario/carrito`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id_Producto: Number(idProducto), cant: 1 })
            });

            const data = await res.json();

            if (!res.ok) {
                // throw new Error(data.mensaje || "No se pudo agregar el producto");
                Swal.fire(data.mensaje);
                return;
            }

            // Reiniciamos la animación si ya estaba corriendo
            toast.classList.remove("show");
            void toast.offsetWidth; // Truco para resetear animaciones CSS
            toast.classList.add("show");

            // La animación de CSS se encarga de ocultarlo, 
            // pero lo limpiamos en JS después de 3s
            setTimeout(() => {
                toast.classList.remove("show");
            }, 3000);
        } catch (err) {
            alert(err.message);
        }
    }

    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('btn-primary')) {
            const idProducto = event.target.dataset.id;
            if (idProducto) {
                agregarProdAlCarrito(idProducto);
            }
        }

        if (event.target.classList.contains('btn-pagina')) {
            paginaActual = Number(event.target.dataset.pagina);
            renderizarPagina();
            window.scrollTo({ top: container.offsetTop - 100, behavior: 'smooth' });
        }
    });

    cargarCatalogo();
});