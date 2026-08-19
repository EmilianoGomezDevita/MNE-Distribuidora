import { Router } from "express";
import { registrar } from "../controllers/authController.js";
import { upload } from "../middlewares/upload.js";

const router = Router();

router.post('/Registro',upload.single('credencial'), registrar);

export default router;