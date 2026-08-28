import { Router } from "express";
import { addAlCarrito, restarItem, eliminarItem } from "../controllers/carritoController.js";
import { verificacionToken } from "../middlewares/verificarToken.js";
import { ListarCarrito } from "../controllers/listarCarrito.js";

const router = Router();

router.post('/carrito', verificacionToken, addAlCarrito)

router.get('/carrito', verificacionToken, ListarCarrito)

router.delete('/carrito/:id', verificacionToken, eliminarItem)

router.patch('/carrito/:id', verificacionToken, restarItem)

export default router