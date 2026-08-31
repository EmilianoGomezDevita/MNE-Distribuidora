import { supabase } from "../config/supabase.js";
import { manejarError } from "../utils/manejoErrores.js";

async function ListarProductos(req, res) {
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
        ImagenesProducto (url, orden)
    `);

    if (errorProds) {
        return manejarError(res, 400, "Error al listar los productos", errorProds);
    }

    let esProfesional = false;

    if (req.usuario) {
        const { data: usuarioDB } = await supabase
            .from("usuarios")
            .select("tipoCuenta")
            .eq("id_U", req.usuario.id)
            .single();

        if (usuarioDB && usuarioDB.tipoCuenta === "Profesional") {
            esProfesional = true;
        }
    }
    const productosFinales = dataProds.map((prod) => {
        return {
            id: prod.id,
            nombre: prod.nombre,
            precio: esProfesional ? prod.precioProfesional : prod.precio,
            descripcion: prod.descripcion,
            stock: prod.stock,
            id_marca: prod.id_marca,
            id_categoria: prod.id_categoria,
            fechaVencimiento: prod.fechaVencimiento,
            imagen: prod.ImagenesProducto.find((img) => img.orden === 1)?.url,
        };
    });

    return res.status(200).json(productosFinales);
}

async function getProdPorId(req, res) {
    const idProd = req.params.id;

    try {
        //PASO 1: verificamos que el ID del producto exista en la DB y traemos la info del prod
        const { data: dataProd, error: errorProd } = await supabase
            .from("Productos")
            .select(`id,
                nombre,
                descripcion,
                precio,
                precioProfesional,
                stock,
                id_marca,
                id_categoria,
                fechaVencimiento,
                ImagenesProducto (url, orden)
            `)
            .eq("id", idProd)
            .single();
        //PASO 2: Validar si no se encontró
        if (errorProd || !dataProd) {
            return res.status(404).json({ mensaje: "Id de producto inexistente" });
        }

        //PASO 3:Verificar si es profesional
        let esProfesional = false;

        if (req.usuario) {
            const { data: usuarioDB } = await supabase
                .from("usuarios")
                .select("tipoCuenta")
                .eq("id_U", req.usuario.id)
                .single();

            if (usuarioDB && usuarioDB.tipoCuenta === "Profesional") {
                esProfesional = true;
            }
        }

        //PASO 4(opciones): traer productso relacionados por marca o categoria

        //PASO 5: armado del map
        const productoFinal = {
            id: dataProd.id,
            nombre: dataProd.nombre,
            precio: esProfesional ? dataProd.precioProfesional : dataProd.precio,
            descripcion: dataProd.descripcion,
            stock: dataProd.stock,
            id_marca: dataProd.id_marca,
            id_categoria: dataProd.id_categoria,
            fechaVencimiento: dataProd.fechaVencimiento,
            // Mantenemos el array de imágenes para el carrusel del frontend
            imagenes: dataProd.ImagenesProducto
                ? dataProd.ImagenesProducto.sort((a, b) => a.orden - b.orden).map(img => img.url)
                : [],
        }
        return res.status(200).json(productoFinal);
    }
    catch (err) {
        manejarError(res, 500, "Error interno del servidor", err)
    }
}

export { ListarProductos, getProdPorId };
