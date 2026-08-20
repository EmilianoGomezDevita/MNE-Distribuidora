import { supabase } from "../config/supabase.js";


async function ListarProductos(req, res) {
    const { data: dataProds, error: errorProds } = await supabase
        .from('Productos')
        .select('*')

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
            precio: esProfesional ? Math.round(prod.precio * 0.60) : prod.precio,//esProfesional ? precioPro : prod.precio, preguntar si todos los prods tienen el mismo descuento
            descripcion: prod.descripcion,
            stock: prod.stock,
            id_marca: prod.id_marca,
            id_categoria: prod.id_categoria,
            fechaVencimiento: prod.fechaVencimiento,
        }
    })

    return res.status(200).json(productosFinales)
}

export { ListarProductos }