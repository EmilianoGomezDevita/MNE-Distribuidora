import { Router } from "express";
import { registrar, iniciar } from "../controllers/authController.js";
import { upload } from "../middlewares/upload.js";

const router = Router();


router.post('/Registro',upload.single('credencial'), registrar);

router.post('/Ingreso', iniciar)

export default router;