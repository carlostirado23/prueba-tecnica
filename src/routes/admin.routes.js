import { Router } from "express";
import { createPatient, createDocument } from "../controllers/admin.controller.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();
router.use(adminMiddleware);

router.post("/patients", createPatient);
router.post("/documents", upload.single("file"), createDocument);

export default router;
