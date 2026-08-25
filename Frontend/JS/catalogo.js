import { API_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem('token');
    
    const container = document.getElementById('grid-productos');
    const template = document.querySelector('.card-producto');

    function formatearPrecio(numero){
        return numero.toLocaleString('es-AR');
    }

    function crearTarjeta(producto){
        const card = template.cloneNode(true);

        card.dataset.id = producto.id

        const img = card.querySelector('.card-img-container img')
        img.src = producto.imagen || '';
        img.alt = producto.nombre;

        const nombreEl = card.querySelector('.prod-nombre, .prod-name');
        nombreEl.textContent = producto.nombre;

        card.querySelector('.product-price').textContent = `$${formatearPrecio(producto.precio)} Iva Inc.`

        const btnAgregar = card.querySelector('.btn-primary');
        btnAgregar.dataset.id = producto.id;

        return card;

    }

    async function cargarCatalogo() {
        try{
            const headers = {}

            if(token){
                headers['Authorization'] = `Bearer ${token}`
            }

            const res = await fetch(`${API_URL}/api/cat/catalogo`, { headers })

            if(!res.ok){
                throw new Error("No se pudo cargar el catalogo")
            }

            const productos = await res.json();

            container.innerHTML = '';//limpia la tarjeta de ejemplo del html

            productos.forEach(producto => {
                container.appendChild(crearTarjeta(producto))
            });
        }
        catch(error){
            console.error('Error al cargar el catalogo: ', error)
        }
    }

    // Delegación de eventos para "Agregar al carrito" (lógica del carrito, pendiente)

    container.addEventListener('click', function(event){
        if(event.target.classList.contains('btn-primary')){
            const idProducto = event.target.dataset.id;
            console.log('Agregar al carrito, producto id:', idProducto)
        }
    })
    cargarCatalogo();
})