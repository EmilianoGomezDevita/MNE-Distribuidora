import { Router } from "express";
import { ListarProductos } from "../controllers/listarProductos.js";
import { identificarUsuario } from "../middlewares/identificarUsuario.js";

const router = Router();

router.get('/catalogo', identificarUsuario, ListarProductos)

export default router;