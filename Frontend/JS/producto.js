import { API_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");

    // 1. Obtener el ID de la URL (ej: producto.html?id=3)
    const urlParams = new URLSearchParams(window.location.search);
    const idProducto = urlParams.get("id");

    if (!idProducto) {
        alert("Producto no especificado.");
        window.location.href = "./catalogo.html";
        return;
    }

    // Nodos del DOM
    const imgPrincipal = document.getElementById("img-principal");
    const galeriaThumbnails = document.getElementById("galeria-thumbnails");
    const productoMarca = document.getElementById("producto-marca");
    const productoTitulo = document.getElementById("producto-titulo");
    const productoPrecio = document.getElementById("producto-precio");
    const productoResumen = document.getElementById("producto-resumen");
    const productoDescripcion = document.getElementById("producto-descripcion-completa");
    const gridRelacionados = document.getElementById("grid-relacionados");

    // Controles de cantidad y carrito
    const inputCantidad = document.getElementById("input-cantidad");
    const btnDisminuir = document.getElementById("btn-disminuir");
    const btnAumentar = document.getElementById("btn-aumentar");
    const btnAgregarCarrito = document.getElementById("btn-agregar-carrito");

    function formatearPrecio(numero) {
        return (numero || 0).toLocaleString("es-AR");
    }

    // 2. Cargar información del producto desde la API
    async function cargarDetalleProducto() {
        try {
            const headers = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const res = await fetch(`${API_URL}/api/cat/catalogo/producto/${idProducto}`, { headers });

            if (!res.ok) {
                throw new Error("No se pudo obtener la información del producto");
            }

            const producto = await res.json();
            renderizarDetalle(producto);
        } catch (error) {
            console.error("Error al cargar producto:", error);
            if (productoTitulo) productoTitulo.textContent = "Producto no encontrado";
        }
    }

    // 3. Renderizar los datos en la pantalla
    function renderizarDetalle(producto) {
        // Títulos y Textos
        document.title = `${producto.nombre} | MNE`;
        if (productoTitulo) productoTitulo.textContent = producto.nombre;
        if (productoPrecio) productoPrecio.textContent = `$${formatearPrecio(producto.precio)}`;
        if (productoResumen) productoResumen.textContent = producto.descripcion || "";
        if (productoDescripcion) productoDescripcion.textContent = producto.descripcion || "Sin descripción detallada.";

        // Galería de imágenes
        const imagenes = producto.imagenes || [];
        if (imagenes.length > 0) {
            imgPrincipal.src = imagenes[0];
            imgPrincipal.alt = producto.nombre;

            if (galeriaThumbnails) {
                galeriaThumbnails.innerHTML = "";
                imagenes.forEach((url, index) => {
                    const thumb = document.createElement("img");
                    thumb.src = url;
                    thumb.alt = `${producto.nombre} miniatura ${index + 1}`;
                    thumb.className = index === 0 ? "thumbnail-active" : "";

                    thumb.addEventListener("click", () => {
                        imgPrincipal.src = url;
                        galeriaThumbnails.querySelectorAll("img").forEach(img => img.classList.remove("thumbnail-active"));
                        thumb.classList.add("thumbnail-active");
                    });

                    galeriaThumbnails.appendChild(thumb);
                });
            }
        }

        // Renderizar Productos Relacionados
        if (gridRelacionados && producto.relacionados) {
            gridRelacionados.innerHTML = "";
            producto.relacionados.forEach(rel => {
                const card = document.createElement("div");
                card.className = "card-producto";
                card.innerHTML = `
                    <div class="card-img-container">
                        <img src="${rel.imagen || ''}" alt="${rel.nombre}">
                    </div>
                    <div class="card-content">
                        <h3 class="prod-nombre">${rel.nombre}</h3>
                        <p class="product-price">$${formatearPrecio(rel.precio)}</p>
                        <a href="./producto.html?id=${rel.id}" class="btn-secondary">Ver producto</a>
                    </div>
                `;
                gridRelacionados.appendChild(card);
            });
        }
        if (productoMarca) productoMarca.textContent = producto.marca;
    }

    // 4. Lógica de controles de cantidad (+ / -)
    if (btnAumentar && btnDisminuir && inputCantidad) {
        btnAumentar.addEventListener("click", () => {
            inputCantidad.value = parseInt(inputCantidad.value) + 1;
        });

        btnDisminuir.addEventListener("click", () => {
            const valorActual = parseInt(inputCantidad.value);
            if (valorActual > 1) {
                inputCantidad.value = valorActual - 1;
            }
        });
    }

    // 5. Agregar al Carrito
    if (btnAgregarCarrito) {
        btnAgregarCarrito.addEventListener("click", async () => {
            if (!token) {
                alert("Debes iniciar sesión para agregar productos al carrito.");
                window.location.href = "./crearCuenta.html";
                return;
            }

            const cantidad = parseInt(inputCantidad.value) || 1;

            try {
                const res = await fetch(`${API_URL}/api/usuario/carrito`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id_Producto: Number(idProducto),
                        cant: cantidad
                    })
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.mensaje || "Error al agregar al carrito");
                }

                // Mostrar toast/mensaje de éxito
                const toast = document.getElementById("toast");
                if (toast) {
                    toast.classList.add("show");
                    setTimeout(() => toast.classList.remove("show"), 3000);
                } else {
                    alert("Producto agregado al carrito con éxito");
                }

            } catch (error) {
                alert(error.message);
            }
        });
    }

    cargarDetalleProducto();
});