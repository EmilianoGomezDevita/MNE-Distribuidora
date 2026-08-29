import { API_URL } from './config.js';

document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);

    if (params.get('form') === 'registro') {
        container.classList.add('active');
    }

    if (params.get('profesional') === 'true') {
        document.getElementById('es-profesional-si').checked = true;
    }
    //Variables de los botones del form para cambiar entre ingresar y registrarse
    const registrarBtn = document.getElementById('btn-show-register')
    const container = document.getElementById('container')
    const ingresarBtn = document.getElementById('btn-show-login')

    //eventos de los botones para cambiar entre ingresar y registrarse
    registrarBtn.addEventListener('click', () => {
        container.classList.add("active");
    });

    ingresarBtn.addEventListener('click', () => {
        container.classList.remove("active")
    })

    //Variables del form profesional
    const formProfesional = document.getElementById('form-profesionales')
    const radioSi = document.getElementById('es-profesional-si')
    const camposProfesional = document.querySelectorAll('#form-profesionales select, #form-profesionales input')

    //funcion que extiende el form para ver los campos de profesional y agrega required
    function actualizarVisibilidadProfesional() {
        const esPro = radioSi ? radioSi.checked : false

        if (formProfesional) {
            formProfesional.classList.toggle('activo', esPro)
        }

        camposProfesional.forEach(campo => {
            campo.required = esPro;
        })
    }

    // Escuchar cambios
    document.querySelectorAll('input[name="es-profesional"]').forEach((radio) => {
        radio.addEventListener('change', actualizarVisibilidadProfesional)
    })

    // Ejecutar al cargar por si está seleccionado de antes
    actualizarVisibilidadProfesional();


    ///LOGICA DEL FORM PARA ATRAPAR LOS CAMPOS DEL FORM PARA EL BACKEND
    const formularioCuenta = document.getElementById('formulario-cuenta')
    const btnEnviarSignUp = document.getElementById('btn-submit-sing-up')
    if (formularioCuenta) {
        formularioCuenta.addEventListener("submit", function (event) {
            event.preventDefault();

            btnEnviarSignUp.disabled = true
            btnEnviarSignUp.textContent = "Procesando..."//pensar en un manseja para el boton

            const formData = new FormData();
            const codPais = document.getElementById("codigo-pais").value;
            const numTelefono = document.getElementById("telefono").value.trim();

            //Datos del usuario
            formData.append("nombre", document.getElementById("nombre").value.trim());
            formData.append("apellido", document.getElementById("apellido").value.trim());
            formData.append("email", document.getElementById("email-sign-up").value.trim());
            formData.append("password", document.getElementById("pswrd-sign-up").value);
            formData.append("telefono", `${codPais} ${numTelefono}`);

            // Datos de la dirección
            formData.append("nombreDireccion", document.getElementById("nombreDireccion").value.trim());
            formData.append("calle", document.getElementById("calle").value.trim());
            formData.append("numeroCalle", document.getElementById("numeroCalle").value.trim());
            formData.append("cp", document.getElementById("cp").value.trim());
            formData.append("piso", document.getElementById("piso").value.trim());
            formData.append("localidad", document.getElementById("localidad").value.trim());
            formData.append("provincia", document.getElementById("provincia").value.trim());

            const esPro = document.getElementById("es-profesional-si").checked;
            formData.append("esProfesional", esPro);

            if (esPro) {
                formData.append("profesion", document.getElementById("profesion").value);
                formData.append("DNI-CUIL", document.getElementById("DNI-CUIL").value.trim());

                // Adjuntamos el archivo binario explícitamente
                const inputCredencial = document.getElementById("credencial");
                if (inputCredencial.files[0]) {
                    formData.append("credencial", inputCredencial.files[0]);
                }
            }
            //api/auth/Registro
            fetch(`${API_URL}/api/auth/Registro`, {
                method: "POST",
                body: formData
            })
                .then((Response) => {
                    if (Response.ok) {
                        alert("Cuenta creada con exito!!!")
                    } else {
                        alert("Hubo un problema al registrar la cuenta")
                    }
                })
                .catch((error) => {
                    console.error("Error en la peticion:", error)
                })
                .finally(() => {
                    btnEnviarSignUp.disabled = false
                    btnEnviarSignUp.textContent = "Enviar"
                })

        })
    }

    // ----------------------------------------------------
    // LOGICA DEL FORMULARIO DE INGRESO / LOGIN
    // ----------------------------------------------------
    const formLogin = document.getElementById('form-login');

    const btnEnviarSignIn = document.getElementById('btn-submit-sing-in')

    if (formLogin) {
        formLogin.addEventListener('submit', function (event) {
            event.preventDefault()

            btnEnviarSignIn.disabled = true
            btnEnviarSignIn.textContent = "Procesando..."

            const email = document.getElementById('email-sing-in').value.trim()
            const password = document.getElementById('pswrd-sing-in').value
            //api/auth/Ingreso
            fetch(`${API_URL}/api/auth/Ingreso`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ///'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email, password })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.token) {
                        // Guardamos el token para usarlo en Mi Perfil
                        localStorage.setItem("token", data.token)
                        alert("Bienvenido!")
                        window.location.href = "./index.html"
                    } else {
                        alert(data.mensaje || "credenciales incorrectas")
                    }
                })
                .catch(error => {
                    console.error("Error en el login", error)
                })
                .finally(() => {
                    btnEnviarSignIn.disabled = false
                    btnEnviarSignIn.textContent = "Enviar"
                })

        })
    }
})