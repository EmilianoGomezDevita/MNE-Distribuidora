import { Router } from "express";
import { registrar } from "../controllers/authController.js";

const router = Router();

router.post('/Registro', registrar);

export default router;