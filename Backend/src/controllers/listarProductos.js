import { supabase } from "../config/supabase.js";


async function ListarProductos(req, res) {
    const { data: dataProds, error: errorProds } = await supabase
        .from('Productos')
        .select(`
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
        return res.status(400).json({ mensaje: "Error al listar los productos", error: errorProds.message })
    }

    let esProfesional = false

    if (req.usuario) {
        const { data: usuarioDB } = await supabase
            .from('usuarios')
            .select('tipoCuenta').eq('id_U', req.usuario.id).single()

        if (usuarioDB && usuarioDB.tipoCuenta === "Profesional") {
            esProfesional = true
        }

    }
    const productosFinales = dataProds.map(prod => {
        return {
            id: prod.id,
            nombre: prod.nombre,
            precio: esProfesional ? prod.precioProfesional : prod.precio,
            descripcion: prod.descripcion,
            stock: prod.stock,
            id_marca: prod.id_marca,
            id_categoria: prod.id_categoria,
            fechaVencimiento: prod.fechaVencimiento,
            imagen: prod.ImagenesProducto.find(img => img.orden === 1)?.url
        }
    })

    return res.status(200).json(productosFinales)
}

export { ListarProductos }