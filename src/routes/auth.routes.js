import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requestPassword, login } from "../controllers/auth.controller.js";

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: "Demasiados intentos. Intenta en 15 minutos." },
});

const router = Router();
router.post("/request-password", limiter, requestPassword);
router.post("/login", limiter, login);

export default router;
