import { Router } from "express";
import { registrar, iniciar } from "../controllers/authController.js";
import { upload } from "../middlewares/upload.js";
import {verificacionToken} from "../middlewares/verificarToken.js"
import { perfil } from "../controllers/perfilController.js";

const router = Router();


router.post('/Registro',upload.single('credencial'), registrar);

router.post('/Ingreso', iniciar)    

router.get('/perfil', verificacionToken, perfil)

export default router;