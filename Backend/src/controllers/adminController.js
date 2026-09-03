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

async function agregarProducto(req, res) {
    let idProductoCreado = null;
    try {
        const { nombreProducto,
            descripcion,
            stock,
            precio,
            precioProfesional,
            id_marca,
            id_categoria,
            fechaVencimiento,
            estado } = req.body;//correcion 5

        const estadoBool = estado === 'on'

        const { data: dataProducto, error: errorProducto } = await supabase
            .from('Productos')
            .insert([{
                nombre: nombreProducto,
                descripcion,
                stock: Number(stock),
                precio: Number(precio),
                precioProfesional: Number(precioProfesional),
                id_marca: Number(id_marca),
                id_categoria: Number(id_categoria),
                fechaVencimiento: fechaVencimiento || null,
                estado: estadoBool
            }]).select().single()

        if (errorProducto) {
            throw new Error(errorProducto.message)
        }

        idProductoCreado = dataProducto.id
        // Si no mandó ninguna imagen, el producto queda creado igual, sin fotos por ahora
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const archivo = req.files[i]
                const nombreArchivo = `${idProductoCreado}-${i}-${archivo.originalname}`

                const { error: errorStorage } = await supabase.storage
                    .from('img-Productos')
                    .upload(nombreArchivo, archivo.buffer, { contentType: archivo.mimetype });

                if (errorStorage) {
                    throw new Error(errorStorage.message)
                }

                // El bucket es público, así que armamos la URL pública directa
                const { data: { publicUrl } } = supabase.storage
                    .from('img-Productos')
                    .getPublicUrl(nombreArchivo);

                // Verificá que la URL existe antes de hacer el insert
                if (!publicUrl) {
                    throw new Error("No se pudo obtener la URL pública de la imagen");
                }

                const { error: errorImg } = await supabase
                    .from('ImagenesProducto')
                    .insert({
                        id_prod: idProductoCreado,
                        url: publicUrl,
                        orden: i + 1
                    });

                if (errorImg) {
                    throw new Error(errorImg.message)
                }

            }
        }
        return res.status(201).json({ mensaje: "Producto agreagdo exitosamente", producto: dataProducto })
    }
    catch (err) {
        // Si el producto ya se había creado antes de que algo fallara,
        // lo borramos para no dejar un producto sin imágenes correctamente cargadas
        if (idProductoCreado) {
            await supabase.from('ImagenesProducto').delete().eq('id_prod', idProductoCreado);
            await supabase.from('Productos').delete().eq('id', idProductoCreado);
        }
        return manejarError(res, 400, "Error al agregar el producto", err)
    }


}

export { listarSolicitudesPendientes, actualizarSolicitud, agregarProducto }
