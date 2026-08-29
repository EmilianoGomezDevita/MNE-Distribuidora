import { API_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = "./crearCuenta.html";
        return;
    }

    const container = document.getElementById('carrito-items-container');
    const emptyState = document.getElementById('carrito-vacio');
    const totalElement = document.getElementById('carrito-total');

    if (!container) {
        console.error("No se encontró #carrito-items-container en el HTML.");
        return;
    }

    // Clonamos el <li> de ejemplo una sola vez, antes de vaciar el contenedor
    const itemPlantilla = container.querySelector('.cart-item')?.cloneNode(true);

    function formatearPrecio(numero) {
        return (numero || 0).toLocaleString('es-AR');
    }

    // La respuesta de GET /api/usuario/carrito es plana:
    // { id, cantidad, id_prod, nombre, precio, imagen } — sin item.productos anidado
    function calcularTotal(items) {
        return items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    }

    function crearFilaItem(item, plantilla) {
        const row = plantilla.cloneNode(true);

        // id (id_IC) para restar/eliminar, id_prod para el botón "+" (reusa el POST de agregar)
        row.dataset.id = item.id;
        row.dataset.idProd = item.id_prod;

        const img = row.querySelector('.cart-item-img img');
        if (img) {
            img.src = item.imagen || '';
            img.alt = item.nombre || '';
        }

        const nombre = row.querySelector('.cart-item-title');
        if (nombre) nombre.textContent = item.nombre || 'Producto';

        const precio = row.querySelector('.cart-item-price span');
        if (precio) precio.textContent = `$${formatearPrecio(item.precio)}`;

        const inputCant = row.querySelector('.input-qty');
        if (inputCant) inputCant.value = item.cantidad;

        const subtotal = row.querySelector('.cart-item-subtotal span');
        if (subtotal) {
            subtotal.textContent = `$${formatearPrecio(item.precio * item.cantidad)}`;
        }

        const btnEliminar = row.querySelector('.btn-remove');
        const botonesQty = row.querySelectorAll('.btn-qty');
        const btnRestar = botonesQty[0];
        const btnSumar = botonesQty[1];

        if (btnEliminar) btnEliminar.dataset.id = item.id;
        if (btnRestar) {
            btnRestar.dataset.id = item.id;
            btnRestar.dataset.action = 'restar';
        }
        if (btnSumar) {
            btnSumar.dataset.idProd = item.id_prod;
            btnSumar.dataset.action = 'sumar';
        }

        return row;
    }

    async function cargarCarrito() {
        try {
            const res = await fetch(`${API_URL}/api/usuario/carrito`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) {
                localStorage.removeItem('token');
                window.location.href = "./crearCuenta.html";
                return;
            }

            if (!res.ok) throw new Error("No se pudo obtener el carrito");

            // El endpoint devuelve el array directo, sin envolverlo en { items: [...] }
            const items = await res.json();

            container.innerHTML = '';

            if (items.length === 0) {
                if (emptyState) emptyState.classList.remove('hidden');
                if (totalElement) totalElement.textContent = '$0';
                return;
            }

            if (emptyState) emptyState.classList.add('hidden');

            items.forEach(item => {
                if (itemPlantilla) {
                    container.appendChild(crearFilaItem(item, itemPlantilla));
                }
            });

            if (totalElement) {
                totalElement.textContent = `$${formatearPrecio(calcularTotal(items))}`;
            }

        } catch (error) {
            console.error('Error al cargar carrito:', error);
        }
    }

    // Restar (PATCH /carrito/:id) — necesita mandar { cant } en el body
    async function restarItem(idItem) {
        try {
            const res = await fetch(`${API_URL}/api/usuario/carrito/${idItem}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cant: 1 })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.mensaje || "Error al actualizar la cantidad");
            }

            await cargarCarrito();
        } catch (error) {
            alert(error.message);
        }
    }

    // Sumar — no existe un endpoint propio, reusa el mismo POST de "agregar al carrito"
    async function sumarItem(idProd) {
        try {
            const res = await fetch(`${API_URL}/api/usuario/carrito`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id_Producto: Number(idProd), cant: 1 })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.mensaje || "Error al sumar el producto");
            }

            await cargarCarrito();
        } catch (error) {
            alert(error.message);
        }
    }

    async function eliminarProducto(idItem) {
        try {
            const res = await fetch(`${API_URL}/api/usuario/carrito/${idItem}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.mensaje || "Error al eliminar el producto");
            }

            await cargarCarrito();
        } catch (error) {
            alert(error.message);
        }
    }

    container.addEventListener('click', function (event) {
        const btnRemove = event.target.closest('.btn-remove');
        if (btnRemove) {
            eliminarProducto(btnRemove.dataset.id);
            return;
        }

        const btnQty = event.target.closest('.btn-qty');
        if (btnQty) {
            if (btnQty.dataset.action === 'sumar') {
                sumarItem(btnQty.dataset.idProd);
            } else {
                restarItem(btnQty.dataset.id);
            }
        }
    });

    cargarCarrito();
});