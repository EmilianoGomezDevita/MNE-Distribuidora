import { Router } from "express";
import { addAlCarrito } from "../controllers/carritoController.js";
import { verificacionToken } from "../middlewares/verificarToken.js";
import { ListarCarrito } from "../controllers/listarCarrito.js";

const router = Router();

router.post('/carrito', verificacionToken, addAlCarrito)

router.get('/carrito', verificacionToken, ListarCarrito)

export default router