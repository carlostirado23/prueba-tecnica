import { Router } from "express";
import { getDocuments, getDocument, downloadDocument } from "../controllers/document.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authMiddleware);

router.get("/", getDocuments);
router.get("/:id", getDocument);
router.get("/:id/download", downloadDocument);

export default router;
