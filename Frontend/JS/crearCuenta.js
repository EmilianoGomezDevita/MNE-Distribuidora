document.addEventListener("DOMContentLoaded", function () {
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
    const btnEnviar = document.getElementById('btn-submit-sing-up')
    if (formularioCuenta) {
        formularioCuenta.addEventListener("submit", function (event) {
            event.preventDefault();

            btnEnviar.disabled = true
            btnEnviar.textContent = "Procesando..."//pensar en un manseja para el boton

            const formData = new FormData();
            const codPais = document.getElementById("codigo-pais").value;
            const numTelefono = document.getElementById("telefono").value.trim();

            //Datos del usuario
            formData.append("nombre", document.getElementById("nombre").value.trim());
            formData.append("apellido", document.getElementById("apellido").value.trim());
            formData.append("email", document.getElementById("email-sign-up").value.trim());
            formData.append("password", document.getElementById("pswrd-sign-up").value);
            formData.append("telefono", `${codPais} ${numTelefono}` );

            // Datos de la dirección
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
                formData.append("matricula", document.getElementById("matricula").value.trim());
                
                // Adjuntamos el archivo binario explícitamente
                const inputCredencial = document.getElementById("credencial");
                if (inputCredencial.files[0]) {
                    formData.append("credencial", inputCredencial.files[0]);
                }
            }

            fetch("api/auth/Registro", {
                method: "POST",
                body: formData
            })
            .then((Response) => {
                if(Response.ok){
                    alert("Cuenta creada con exito!!!")
                }else {
                    alert("Hubo un problema al registrar la cuenta")
                }
            })
            .catch((error) => {
                console.error("Error en la peticion:", error)
            })
            .finally(() => {
                btnEnviar.disabled = false
                btnEnviar.textContent = "Enviar"
            })

        })
    }
})