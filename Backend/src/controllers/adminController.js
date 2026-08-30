import { supabase } from "../config/supabase.js";
import { manejarError } from "../utils/manejoErrores.js";

async function listarSolicitudesPendientes(req, res) {
    const { data: dataSP, error: errorSP } = await supabase
        .from("SolicitudProfesional")
        .select(
        `
        id_SP,
        DNI-CUIL,
        documentacion,
        estado,
        fechaSolicitud,
        usuarios (nombre, apellido, email),
        Profesiones (profesion)
        `,
        )
        .eq("estado", "pendiente");

    if (errorSP) {
        return manejarError(res, 400, "Error al intentar acceder a los datos", errorSP)
    }

    return res.status(200).json({
        mensaje: "Informacion obtenida de manera exitosa",
        dataSP
    })

}

async function actualizarSolicitud(req, res) {
    const idSolicitud = req.params.id;
    let estadoCambiado = false;

    const { decision } = req.body;
    if (decision !== 'aprobado' && decision !== 'rechazado') {
        return res.status(400).json({ mensaje: "Decision invalida, debe ser aprobado o rechazado" })
    }
    try {
        const { data: dataDecision, error: errorDesicion } = await supabase
            .from('SolicitudProfesional')
            .update({ estado: decision })
            .eq('id_SP', idSolicitud)
            .select('user_USP')// devuelve el id del usuario dueño
            .single()

        if (errorDesicion) {
            console.log('Error completo:', errorDesicion);
            throw new Error(errorDesicion.message);
        }
        estadoCambiado = true;
        if (decision === "aprobado") {
            const { data: dataEstado, error: errorEstado } = await supabase
                .from('usuarios')
                .update({ tipoCuenta: "Profesional" })
                .eq("id_U", dataDecision.user_USP)

            if (errorEstado) {
                console.log("Error completo:", errorEstado)
                throw new Error(errorEstado.message)
            }
        }

        return res.status(200).json({ mensaje: "Solicitud actualizada con éxito" })
    }
    catch (err) {
        if (estadoCambiado === true) {
            const { error: errorRevertir } = await supabase
                .from('SolicitudProfesional')
                .update({ estado: "pendiente" })
                .eq('id_SP', idSolicitud)
                .single()
        }
        return manejarError(res, 400, "Error al completar la actualizacion", err)
    }



}

export { listarSolicitudesPendientes, actualizarSolicitud }
