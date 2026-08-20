import { supabase } from "../config/supabase.js";

async function identificarUsuario(req, res, next) {
    const authHeader = req.headers.authorization;
    let token = null

    if (authHeader) {
        const partes = authHeader.split(' ');
        token = partes[1];
        const { data: {dataUser}, error: errorUser } = await supabase.auth.getUser(token)

        if (errorUser) {
            req.usuario = null
        }
        else {
            req.usuario.user.id = dataUser
        }
    }
    next()
}

export { identificarUsuario }