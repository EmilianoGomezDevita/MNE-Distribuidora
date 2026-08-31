import { Router } from "express";
import { ListarProductos, getProdPorId } from "../controllers/listarProductos.js";
import { identificarUsuario } from "../middlewares/identificarUsuario.js";

const router = Router();

router.get('/catalogo', identificarUsuario, ListarProductos)

router.get('/catalogo/producto/:id', identificarUsuario, getProdPorId)

export default router;