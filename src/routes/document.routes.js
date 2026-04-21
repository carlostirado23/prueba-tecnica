import { Router } from "express";
import { getDocuments, getDocument, requestDownload, serveFile } from "../controllers/document.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Rutas públicas (autenticadas por token firmado en query param)
router.get("/:id/file", serveFile);

// Rutas protegidas con Bearer JWT
router.use(authMiddleware);
router.get("/", getDocuments);
router.get("/:id", getDocument);
router.get("/:id/download", requestDownload);

export default router;
