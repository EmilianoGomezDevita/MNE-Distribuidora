import { API_URL } from "../config.js";

document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token')

    if (!token) {
        window.location.href = "../crearCuenta.html"
        return;
    }
    const formProd = document.getElementById('form-producto');
    const btnGuardar = formProd?.querySelector('button[type="submit"]');

    if (!formProd) return;

    formProd.addEventListener('submit', async function (event) {
        event.preventDefault();

        btnGuardar.disabled = true
        btnGuardar.textContent = "Guardando..."

        // FormData construido directo del <form> — toma todos los campos por su "name",
        // incluidos los archivos del input múltiple, sin tener que armarlo campo por campo a mano.


        const formData = new FormData(formProd)

        try {
            const res = await fetch(`${API_URL}/api/admin/producto/add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Ojo: NO se pone 'Content-Type' a mano acá — el navegador arma
                    // automáticamente el boundary correcto de multipart/form-data.
                },
                body: formData
            });

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.mensaje || "No se pudo agregar el producto")
            }

            Swal.fire({
                title: '¡Listo!',
                text: 'Producto agregado exitosamente.',
                icon: 'success',
                confirmButtonColor: '#1A1A1A'
            })
            formProd.reset();
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: error.message,
                icon: 'error',
                confirmButtonColor: '#1A1A1A'
            });
        }finally{
            btnGuardar.disabled = false
            btnGuardar.textContent = "Guardar producto"
        }
    })
})

