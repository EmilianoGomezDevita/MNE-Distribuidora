import { API_URL } from "./config.js";

document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = "./crearCuenta.html";
        return;
    }

    const lista = document.getElementById('lista-favoritos');
    const template = lista.querySelector('.fav-card');
    const vacioEl = document.getElementById('favs-vacio');
    const countEl = document.getElementById('favs-count');

    function formatearPrecio(numero) {
        return (numero || 0).toLocaleString('es-AR');
    }

    function crearTarjeta(fav) {
        const card = template.cloneNode(true);
        card.dataset.id = fav.id_producto;

        const img = card.querySelector('.fav-card-img img');
        img.src = fav.imagen || '';
        img.alt = fav.nombre;

        card.querySelector('.fav-card-marca').textContent = fav.marca || '';
        card.querySelector('.fav-card-nombre').textContent = fav.nombre;
        card.querySelector('.fav-card-precio').textContent = `$${formatearPrecio(fav.precio)}`;

        const link = card.querySelector('.fav-card-link');
        if (link) link.href = `./producto.html?id=${fav.id_producto}`;

        const btnRemove = card.querySelector('.fav-remove');
        if (btnRemove) btnRemove.dataset.id = fav.id_producto;

        const btnAgregarCarrito = card.querySelector('.fav-add-cart');
        if (btnAgregarCarrito) btnAgregarCarrito.dataset.id = fav.id_producto;

        return card;
    }

    function renderizar(favoritos) {
        lista.innerHTML = '';
        countEl.textContent = favoritos.length;

        if (favoritos.length === 0) {
            vacioEl.classList.remove('hidden');
            return;
        }

        vacioEl.classList.add('hidden');
        favoritos.forEach(fav => {
            lista.appendChild(crearTarjeta(fav));
        });
    }

    async function cargarFavoritos() {
        try {
            const res = await fetch(`${API_URL}/api/usuario/favoritos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) {
                localStorage.removeItem('token');
                window.location.href = "./crearCuenta.html";
                return;
            }

            if (!res.ok) throw new Error("No se pudieron cargar los favoritos");

            const favoritos = await res.json();
            renderizar(favoritos);

        } catch (error) {
            console.error('Error al cargar favoritos:', error);
        }
    }

    async function quitarDeFavoritos(idProducto) {
        try {
            const res = await fetch(`${API_URL}/api/usuario/favoritos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id_producto: Number(idProducto) })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.mensaje || "No se pudo quitar de favoritos");
            }

            // Como esta página solo lista favoritos ya existentes, el toggle
            // acá siempre significa "quitar" — recargamos la lista actualizada.
            await cargarFavoritos();

        } catch (error) {
            Swal.fire(error.message);
        }
    }

    async function agregarAlCarrito(idProducto) {
        try {
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
                throw new Error(data.mensaje || "No se pudo agregar al carrito");
            }

            Swal.fire({
                title: 'Agregado',
                text: 'Producto agregado al carrito.',
                icon: 'success',
                confirmButtonColor: '#1A1A1A'
            });

        } catch (error) {
            Swal.fire(error.message);
        }
    }

    lista.addEventListener('click', function (event) {
        const btnRemove = event.target.closest('.fav-remove');
        if (btnRemove) {
            event.preventDefault(); // por si el botón queda dentro del <a>
            quitarDeFavoritos(btnRemove.dataset.id);
            return;
        }

        const btnAgregar = event.target.closest('.fav-add-cart');
        if (btnAgregar) {
            event.preventDefault();
            agregarAlCarrito(btnAgregar.dataset.id);
        }
    });

    cargarFavoritos();
});