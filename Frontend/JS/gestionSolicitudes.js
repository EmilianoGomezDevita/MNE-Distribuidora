import { API_URL } from './config.js';

document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('token');

    // Si no hay sesión, no tiene sentido mostrar nada de este panel
    if (!token) {
        window.location.href = "./crearCuenta.html";
        return;
    }

    const container = document.getElementById('solicitudes-container');
    const emptyState = document.getElementById('no-solicitudes');

    // Guardamos la tarjeta de ejemplo como "plantilla" antes de vaciar el contenedor
    const template = container.querySelector('.solicitud-card');

    function formatearFecha(fechaISO) {
        return new Date(fechaISO).toLocaleDateString('es-AR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    }

    function crearTarjeta(solicitud) {
        const card = template.cloneNode(true);

        card.dataset.id = solicitud.id_SP;

        card.querySelector('.user-name').textContent =
            `${solicitud.usuarios.nombre} ${solicitud.usuarios.apellido}`;
        card.querySelector('.user-email').textContent = solicitud.usuarios.email;
        card.querySelector('.badge-estado').textContent = solicitud.estado;

        const valores = card.querySelectorAll('.info-item .value');
        valores[0].textContent = solicitud.Profesiones.profesion;
        valores[1].textContent = solicitud.DNI-CUIL;
        valores[2].textContent = formatearFecha(solicitud.fechaSolicitud);

        const btnDoc = card.querySelector('.btn-doc');
        btnDoc.dataset.id = solicitud.id_SP;
        btnDoc.dataset.path = solicitud.documentacion;

        const btnAprobar = card.querySelector('.btn-aprobar');
        const btnRechazar = card.querySelector('.btn-rechazar');
        btnAprobar.dataset.id = solicitud.id_SP;
        btnRechazar.dataset.id = solicitud.id_SP;

        return card;
    }

    async function cargarSolicitudes() {
        try {
            // CORREGIDO: Se agregó API_URL antes del endpoint
            const res = await fetch(`${API_URL}/api/admin/solicitudes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                throw new Error('No se pudieron cargar las solicitudes');
            }

            const data = await res.json();
            const solicitudes = data.dataSP;

            container.innerHTML = ''; // limpiamos, incluida la tarjeta de ejemplo

            if (solicitudes.length === 0) {
                emptyState.classList.remove('hidden');
                return;
            }

            emptyState.classList.add('hidden');
            solicitudes.forEach(solicitud => {
                container.appendChild(crearTarjeta(solicitud));
            });

        } catch (error) {
            console.error('Error al cargar solicitudes:', error);
        }
    }

    async function enviarDecision(idSolicitud, decision) {
        try {
            // CORREGIDO: Se agregó /${idSolicitud} al final de la ruta
            const res = await fetch(`${API_URL}/api/admin/solicitudes/${idSolicitud}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ decision })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.mensaje || 'Error al actualizar la solicitud');
            }

            // Una vez resuelta, la sacamos de la vista sin recargar todo de nuevo
            const card = container.querySelector(`[data-id="${idSolicitud}"]`);
            if (card) card.remove();

            if (!container.querySelector('.solicitud-card')) {
                emptyState.classList.remove('hidden');
            }

        } catch (error) {
            alert(error.message);
        }
    }

    // Delegación de eventos: un solo listener en el contenedor
    container.addEventListener('click', function (event) {
        const idSolicitud = event.target.dataset.id;

        if (event.target.classList.contains('btn-aprobar')) {
            enviarDecision(idSolicitud, 'aprobado');
        }

        if (event.target.classList.contains('btn-rechazar')) {
            enviarDecision(idSolicitud, 'rechazado');
        }

        if (event.target.classList.contains('btn-doc')) {
            console.log('Ver documento:', event.target.dataset.path);
        }
    });

    cargarSolicitudes();
});