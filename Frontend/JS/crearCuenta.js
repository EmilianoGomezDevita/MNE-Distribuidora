const registrarBtn = document.getElementById('btn-show-register')
const container = document.getElementById('container')
const ingresarBtn = document.getElementById('btn-show-login')

registrarBtn.addEventListener('click', () => {
    container.classList.add("active");
});

ingresarBtn.addEventListener('click', ()=>{
    container.classList.remove("active")
})

const formProfesional = document.getElementById('form-profesionales')
const radioSi = document.getElementById('es-profesional-si')

function actualizarVisibilidadProfesional() {
    if (radioSi && formProfesional) {
        formProfesional.classList.toggle('activo', radioSi.checked)
    }
}

// Escuchar cambios
document.querySelectorAll('input[name="es-profesional"]').forEach((radio) => {
  radio.addEventListener('change', actualizarVisibilidadProfesional)
})

// Ejecutar al cargar por si está seleccionado de antes
actualizarVisibilidadProfesional();