import { supabase } from "../config/supabase.js";
import { manejarError } from "../utils/manejoErrores.js";

async function ListarCarrito(req, res) {
    const { data: carrito, error: errorCarrito } = await supabase
        .from('Carritos')
        .select('id')
        .eq('id_User', req.usuario.id)
        .maybeSingle();

    if (errorCarrito) {
        return manejarError(res, 400, "Error al buscar el carrito", errorCarrito);
    }

    if (!carrito) {
        return res.status(200).json([]); // nunca agregó nada, carrito "vacío"
    }

    const { data: carritoItems, error: errorListarCarrito } = await supabase
        .from('itemsCarrito')
        .select(`
        id_IC,
        cantidad,
        Productos(id, nombre, precio, precioProfesional, ImagenesProducto(url, orden))    
    `)
        .eq('id_C', carrito.id)

    if (errorListarCarrito) {
        return manejarError(res, 400, "Error al listar el carrito", errorCarrito);
    }

    let esProfesional = false

    if (req.usuario) {
        const { data: dataUser, error: errorGetUser } = await supabase
            .from('usuarios')
            .select('tipoCuenta').eq('id_U', req.usuario.id).single()

        if (dataUser.tipoCuenta === "Profesional") {
            esProfesional = true
        }
    }
    const carritoFinal = carritoItems.map(item => {
        return {
            id: item.id_IC,
            cantidad: item.cantidad,
            id_prod: item.Productos.id,
            nombre: item.Productos.nombre,
            precio: esProfesional ? item.Productos.precioProfesional : item.Productos.precio,
            imagen: item.Productos.ImagenesProducto.find(img => img.orden === 1)?.url

        }
    })

    return res.status(200).json(carritoFinal)

}

export {ListarCarrito}