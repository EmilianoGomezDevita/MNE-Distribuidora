import { supabase } from "../config/supabase.js"

async function verificarAdmin(req, res, next) {
    const userId = req.usuario.id

    const {data: dataUser, error: errorUser} = await supabase
    .from('usuarios')
    .select('rol').eq('id_U', userId).single()
    if(errorUser){
        return res.status(400).json({mensaje: "Error al intentar acceder a los datos", error: errorUser.message})
    }
    if(dataUser.rol !== 'Admin'){
        return res.status(403).json({mensaje: "Acceso denegado: se requieren permisos de administrador"})
    }

    next()

}

export {verificarAdmin}