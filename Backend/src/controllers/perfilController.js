import { supabase } from "../config/supabase.js";

async function perfil(req, res) {
    const { data: usuarioDB, error: errorPerfil} = await supabase
    .from("usuarios")
    .select("nombre, apellido, tipoCuenta").eq('id_U', req.usuario.id).single()

    if(errorPerfil){
        return res.status(400).json({mensaje: "Error al obtener la informacion del perfil", error: errorPerfil.message})
    }

    return res.status(200).json({
        mensaje: "Perfil obtenido conexito",
        ...usuarioDB,
        email: req.usuario.email
    })
}  

export {perfil}