import { supabase } from "../config/supabase.js";

async function listarSolicitudesPendientes(req, res) {
  const { data: dataSP, error: errorSP } = await supabase
    .from("SolicitudProfesional")
    .select(
      `
    id_SP,
    matricula,
    documentacion,
    estado,
    fechaSolicitud,
    usuarios (nombre, apellido, email),
    Profesiones (nombre)
  `,
    )
    .eq("estado", "pendiente");

    if(errorSP){
        return res.status(400).json({mensaje: "Error al intentar acceder a los datos", error: errorSP.message})
    }
     
    return res.status(200).json({
        mensaje: "Informacion obtenida de manera exitosa",
        dataSP
    })

}

export {listarSolicitudesPendientes }
