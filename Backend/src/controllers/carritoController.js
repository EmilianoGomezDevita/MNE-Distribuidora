import { supabase } from '../config/supabase.js'
import { manejarError } from '../utils/manejoErrores.js';

async function addAlCarrito(req, res) {
    const idUsuario = req.usuario.id;
    const { id_Producto, cant } = req.body;

    try {
        // Paso 1: buscar si el usuario ya tiene un carrito
        const { data: carritoExiste, error: errorBuscarCarrito } = await supabase
            .from('Carritos')
            .select('id')
            .eq('id_User', idUsuario)
            .maybeSingle();// a diferencia de .single(), no tira error si no hay ninguna fila

        if (errorBuscarCarrito) {
            throw new Error(errorBuscarCarrito.message)
        }
        let idCarrito;

        if (carritoExiste) {
            idCarrito = carritoExiste.id
        } else {
            // Paso 2: no tenía carrito, se lo creamos
            const { data: carritoNuevo, error: errorCrearCarrito } = await supabase
                .from('Carritos')
                .insert({ id_User: idUsuario })
                .select('id')
                .single();

            if (errorCrearCarrito) {
                throw new Error(errorCrearCarrito.message)
            }

            idCarrito = carritoNuevo.id
        }
        // Paso 3: ¿ya tenía este producto en el carrito?
        const { data: itemExistente, error: errorConsultaCant } = await supabase
            .from('itemsCarrito')
            .select('id_IC, cantidad')
            .eq('id_C', idCarrito)
            .eq('id_prod', id_Producto)
            .maybeSingle()

        if (errorConsultaCant) {
            throw new Error(errorConsultaCant.message)
        }

        // Paso 4: según el resultado del paso 3, insert o update sumando cantidad
        if (itemExistente) {
            const nuevaCant = itemExistente.cantidad + cant;
            const { error: errrorUpdate } = await supabase
                .from('itemsCarrito')
                .update({ cantidad: nuevaCant })
                .eq('id_IC', itemExistente.id_IC)

            if (errrorUpdate) {
                throw new Error(errrorUpdate.message)
            }
        } else {
            const { error: errorInsert } = await supabase
                .from('itemsCarrito')
                .insert({
                    id_C: idCarrito,
                    id_prod: id_Producto,
                    cantidad: cant
                })
            if (errorInsert) {
                throw new Error(errorInsert.message)
            }
        }
        res.status(201).json({ mensaje: "Producto agregado al carrito" })
    }

    catch (err) {
        return manejarError(res, 400, "Error al agregar al carrito", err);
    }
}

//FUNCIONA PARA RESTAR CANTIDAD DE UN ITEM
async function restarItem(req, res) {
    const idItem = req.params.id;
    const idUsuario = req.usuario.id;
    const { cant } = req.body;

    try {
        //paso 1: buscar el carrito del usuario
        const { data: dataCarrito, error: errorBuscarCarrito } = await supabase
            .from('Carritos')
            .select('id')
            .eq('id_User', idUsuario)
            .maybeSingle();// a diferencia de .single(), no tira error si no hay ninguna fila

        if (errorBuscarCarrito) {
            throw new Error(errorBuscarCarrito.message)
        }
        if (!dataCarrito) {
            return res.status(404).json({ mensaje: "No tenés ningún carrito, Primero debes agregar un producto al carrito" });
        }
        // Paso 2: ¿ya tenía este producto en el carrito?
        const { data: itemExistente, error: errorConsultaCant } = await supabase
            .from('itemsCarrito')
            .select('id_IC, cantidad')
            .eq('id_IC', idItem)
            .eq('id_C', dataCarrito.id)

            .maybeSingle()

        if (errorConsultaCant) {
            throw new Error(errorConsultaCant.message)
        }
        if (!itemExistente) {
            return res.status(404).json({ mensaje: "El producto no existe en tu carrito" });
        }
        // Paso3: restar el item, pero SOLO si pertenece a este carrito
        const nuevaCant = itemExistente.cantidad - cant;

        if (nuevaCant <= 0) {
            const { error: errorDelete } = await supabase
                .from('itemsCarrito')
                .delete()
                .eq('id_IC', itemExistente.id_IC)

            if (errorDelete) {
                throw new Error(errorDelete.message)
            }
            return res.status(200).json({ mensaje: "Producto eliminado del carrito" })
        } else {
            const { error: errrorUpdate } = await supabase
                .from('itemsCarrito')
                .update({ cantidad: nuevaCant })
                .eq('id_IC', idItem)
                .eq('id_C', dataCarrito.id) // <- esta segunda condición es la clave de seguridad

            if (errrorUpdate) {
                throw new Error(errrorUpdate.message)
            }

            res.status(200).json({ mensaje: "Cantidad actualizada", cantidad: nuevaCant })
        }


    }
    catch (err) {
        return manejarError(res, 400, "Error al actualizar la cantidad", err);
    }
}
//FUNCIONA PARA ELIMINAR ITEM DEL CARRITO
async function eliminarItem(req, res) {
    const idItem = req.params.id;
    const idUsuario = req.usuario.id;

    try {
        //paso 1: buscar el carrito del usuario
        const { data: dataCarrito, error: errorBuscarCarrito } = await supabase
            .from('Carritos')
            .select('id')
            .eq('id_User', idUsuario)
            .maybeSingle();// a diferencia de .single(), no tira error si no hay ninguna fila

        if (errorBuscarCarrito) {
            throw new Error(errorBuscarCarrito.message)
        }
        if (!dataCarrito) {
            return res.status(404).json({ mensaje: "No tenés ningún carrito" });
        }

        // Paso 2: borrar el item, pero SOLO si pertenece a este carrito
        const { error: errorDelete } = await supabase
            .from('itemsCarrito')
            .delete()
            .eq('id_IC', idItem)
            .eq('id_C', dataCarrito.id)

        if (errorDelete) {
            throw new Error(errorDelete.message)
        }
        return res.status(200).json({ mensaje: "Producto eliminado del carrito" });
    }
    catch (err) {
        return manejarError(res, 400, "Error al eliminar del carrito", err);
    }
}

export { addAlCarrito, restarItem, eliminarItem };