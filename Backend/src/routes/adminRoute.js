import { Router } from "express";
import { ListarProductos } from "../controllers/listarProductos.js"
import { actualizarSolicitud, listarSolicitudesPendientes,  } from "../controllers/adminController.js"
import { ListarAllProductos, agregarProducto, actualizarProducto } from "../controllers/prodsGestion.js";
import { verificarAdmin } from "../middlewares/verificarAdmin.js";
import { verificacionToken } from "../middlewares/verificarToken.js";
import { upload } from "../middlewares/upload.js";

const router = Router()

router.get('/solicitudes', verificacionToken, verificarAdmin, listarSolicitudesPendientes)

router.patch('/solicitudes/:id', verificacionToken, verificarAdmin, actualizarSolicitud)

router.get('/productos',verificacionToken, verificarAdmin, ListarAllProductos   )

router.post('/producto/add',verificacionToken, verificarAdmin, upload.array('imagenes', 5), agregarProducto) 

router.patch('/producto/:id', verificacionToken, verificarAdmin, actualizarProducto)

export default router