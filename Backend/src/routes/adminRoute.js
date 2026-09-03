import { Router } from "express";
import { ListarProductos } from "../controllers/listarProductos.js"
import { actualizarSolicitud, listarSolicitudesPendientes, agregarProducto } from "../controllers/adminController.js"
import { verificarAdmin } from "../middlewares/verificarAdmin.js";
import { verificacionToken } from "../middlewares/verificarToken.js";
import { upload } from "../middlewares/upload.js";

const router = Router()

router.get('/solicitudes', verificacionToken, verificarAdmin, listarSolicitudesPendientes)

router.patch('/solicitudes/:id', verificacionToken, verificarAdmin, actualizarSolicitud)

router.get('/productos',verificacionToken, verificarAdmin, ListarProductos)

router.post('/producto/add',verificacionToken, verificarAdmin, upload.array('imagenes', 5), agregarProducto) 

export default router