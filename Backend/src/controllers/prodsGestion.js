import { supabase } from "../config/supabase.js";
import { manejarError } from "../utils/manejoErrores.js";

async function ListarAllProductos(req, res) {
    const { data: dataProds, error: errorProds } = await supabase.from(
        "Productos",
    ).select(`
        id,
        nombre,
        descripcion,
        precio,
        precioProfesional,
        stock,
        id_marca,
        id_categoria,
        fechaVencimiento,
        estado,
        Marcas(nombre),
        Categorias(nombre),
        ImagenesProducto (url, orden)
    `);

    if (errorProds) {
        return manejarError(res, 400, "Error al listar los productos", errorProds);
    }

    // let esProfesional = false;

    // if (req.usuario) {
    //     const { data: usuarioDB } = await supabase
    //         .from("usuarios")
    //         .select("tipoCuenta")
    //         .eq("id_U", req.usuario.id)
    //         .single();

    //     if (usuarioDB && usuarioDB.tipoCuenta === "Profesional") {
    //         esProfesional = true;
    //     }
    // }
    const productosFinales = dataProds.map((prod) => {
        return {
            id: prod.id,
            nombre: prod.nombre,
            precio: prod.precio,
            precioProfecional: prod.precioProfesional,
            descripcion: prod.descripcion,
            stock: prod.stock,
            marca: prod.Marcas.nombre,
            categoria: prod.Categorias.nombre,
            fechaVencimiento: prod.fechaVencimiento,
            estado: prod.estado,
            imagen: prod.ImagenesProducto.find((img) => img.orden === 1)?.url,
        };
    });

    return res.status(200).json(productosFinales);
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

async function actualizarProducto(req, res) {
    const idProd = req.params.id
    const body = req.body
    let deBajaLogica = false

    // 1. Validar id
    if (!idProd) {
        return res.status(400).json({ mensaje: "ID de producto no proporcionado" });
    }

    try{
        // 2. Armar el objeto solo con los campos recibidos
        const datosCambiar = {};

        if (body.nombreProducto !== undefined) datosCambiar.nombre = body.nombreProducto;
        if (body.descripcion !== undefined) datosCambiar.descripcion = body.descripcion;
        if (body.stock !== undefined) datosCambiar.stock = Number(body.stock);
        if (body.precio !== undefined) datosCambiar.precio = Number(body.precio);
        if (body.precioProfesional !== undefined) datosCambiar.precioProfesional = Number(body.precioProfesional);
        if (body.id_marca !== undefined) datosCambiar.id_marca = Number(body.id_marca);
        if (body.id_categoria !== undefined) datosCambiar.id_categoria = Number(body.id_categoria);
        if (body.fechaVencimiento !== undefined) datosCambiar.fechaVencimiento = body.fechaVencimiento || null;

        // 3. Manejo flexible del estado (baja/alta lógica)
        if(body.estado !== undefined){
            // Maneja si viene boolean directo (true/false) o string ('activo', 'true', 'on')
            if(typeof body.estado === 'boolean'){
                datosCambiar.estado = body.estado;
            }else if(typeof body.estado === 'string'){
                datosCambiar.estado = (body.estado === 'activo' || body.estado === 'true' || body.estado === 'on');
            }
        }

        // 4. Si no mandó nada para actualizar
        if(Object.keys(datosCambiar).length === 0){
            return res.status(400).json({ mensaje: "No se enviaron campos para actualizar" });
            //confirmar si cambiar por throw new o manejarError
        }

        // 5. Ejecutar actualización en Supabase
        const { data: prodActualizado, error: errorActProd} = await supabase
        .from('Productos')
        .update(datosCambiar)
        .eq('id', idProd)
        .select().single()

        if(errorActProd){
            throw new Error(errorActProd.message)
        }

        return res.status(200).json({
            mensaje: "Producto actualizado correctamente", 
            producto: prodActualizado
        })
    }catch(err){
        return manejarError(res, 400, "Error al actualizar el producto", err)
    }

}

export { ListarAllProductos, agregarProducto, actualizarProducto}