import { Router } from "express";
import { upload } from "../middlewares/upload.js";
import {verificacionToken} from "../middlewares/verificarToken.js"
import { toggleFavorito, listaFavoritos } from "../controllers/favsController.js";

const router = Router();

router.post('/favoritos', verificacionToken, toggleFavorito)

router.get('/favoritos', verificacionToken, listaFavoritos)

export default router