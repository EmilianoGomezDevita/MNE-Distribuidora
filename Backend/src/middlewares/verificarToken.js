import { supabase } from "../config/supabase.js";

async function verificacionToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ 
            mensaje: "Acceso no autorizado", 
            error: "No se proporcionó el encabezado de autorización" 
        });
    }
    const partes = authHeader.split(' ');
    const token = partes[1]; 
    const { data: {user}, error: errorUser } = await supabase.auth.getUser(token)

    if (errorUser || !user) {
        return res.status(401).json({ 
            mensaje: "Token inválido o expirado", 
            error: errorUser ? errorUser.message : "Usuario no encontrado" 
        });
    }
    req.usuario = user
    next()
}

export { verificacionToken }