import { Router } from "express";
import { actualizarSolicitud, listarSolicitudesPendientes } from "../controllers/adminController.js"
import { verificarAdmin } from "../middlewares/verificarAdmin.js";
import { verificacionToken } from "../middlewares/verificarToken.js";

const router = Router()

router.get('/solicitudes', verificacionToken, verificarAdmin, listarSolicitudesPendientes)

router.patch('/solicitudes/:id', verificacionToken, verificarAdmin, actualizarSolicitud)

export default router