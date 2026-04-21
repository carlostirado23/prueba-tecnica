import { Router } from "express";
import { createPatient, createDocument } from "../controllers/admin.controller.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = Router();
router.use(adminMiddleware);

router.post("/patients", createPatient);
router.post("/documents", createDocument);

export default router;
