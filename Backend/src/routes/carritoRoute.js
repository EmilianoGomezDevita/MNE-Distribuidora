import { Router } from "express";
import { addAlCarrito } from "../controllers/caritoController.js";
import { verificacionToken } from "../middlewares/verificarToken.js";

const router = Router();

router.post('/carrito', verificacionToken, addAlCarrito)

export default router