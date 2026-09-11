import { supabase } from "../config/supabase.js";
import { manejarError } from "../utils/manejoErrores.js";


async function toggleFavorito(req, res) {
    const idUsuario = req.usuario.id
    const { id_producto } = req.body

    if (!id_producto) {
        return res.status(400).json({ mensaje: "Falta especificar el producto" });
    }

    try {
        // Paso 1: buscar si el usuario ya tiene un carrito
        const { data: favExiste, error: errorBuscarFav } = await supabase
            .from('Favs')
            .select("id_U, id_prod")
            .eq('id_U', idUsuario)
            .eq('id_prod', id_producto)
            .maybeSingle();// a diferencia de .single(), no tira error si no hay ninguna fila

        if (errorBuscarFav) {
            throw new Error(errorBuscarFav.message)
        }
        if (favExiste) {
            // Paso 2: no tenía carrito, se lo creamos
            const { error: errorEliminar } = await supabase
                .from('Favs')
                .delete()
                .eq('id_U', idUsuario)
                .eq('id_prod', id_producto);

            if (errorEliminar) {
                throw new Error(errorEliminar.message);
            }
            return res.status(200).json({ mensaje: "Producto eliminado de favoritos" });
        }
        else {
            // No era favorito → lo agregamos (INSERT completo)
            const { error: errorCrear } = await supabase
                .from('Favs')
                .insert({
                    id_U: idUsuario,
                    id_prod: id_producto,
                    fechaAgregado: new Date()
                });

            if (errorCrear) {
                throw new Error(errorCrear.message)
            }
            return res.status(201).json({ mensaje: "Producto agregado a favoritos" })
        }
    }
    catch (err) {
        manejarError(res, 400, "Error al leer los favoritos", err)
    }
}

async function listaFavoritos(req, res) {
    const idUsuario = req.usuario.id

    const { data: dataFavs, error: errorFavs } = await supabase
        .from('Favs')
        .select(`
            id,
            Productos(id, nombre, precio, precioProfesional,Marcas(nombre), ImagenesProducto(url, orden))
        `)
        .eq('id_U', idUsuario)

    if (errorFavs) {
        return manejarError(res, 400, "Error al listar los favoritos", errorFavs);
    }

    let esProfesional = false;

    if (req.usuario) {
        const { data: dataUsuario } = await supabase
            .from('usuarios')
            .select("tipoCuenta")
            .eq("id_U", req.usuario.id)
            .single();

        if (dataUsuario && dataUsuario.tipoCuenta === "Profesional") {
            esProfesional = true;
        }
    }


    //map() del producto
    const favoritos = dataFavs.map(fav => {
        return {
            id: fav.id,
            id_producto: fav.Productos.id,
            nombre: fav.Productos.nombre,
            marca: fav.Productos.Marcas?.nombre || '',
            precio: esProfesional ? fav.Productos.precioProfesional : fav.Productos.precio,
            imagen: fav.Productos.ImagenesProducto.find(img => img.orden === 1)?.url
        }
    })

    return res.status(200).json(favoritos)
}

export { toggleFavorito, listaFavoritos }