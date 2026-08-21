import { identificarUsuario } from "./identificarUsuario.js"

async function verificarAdmin(req, res, next) {
    const { data: {user}, error: errorUser } = await identificarUsuario.auth.getUser()

    req.usuario = user
}