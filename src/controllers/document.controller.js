import { getDocsService, getDocService } from "../services/document.service.js";
import { generateDownloadToken, verifyDownloadToken } from "../services/token.service.js";
import { generatePDF } from "../services/pdf.service.js";

export const getDocuments = async (req, res) => {
    const docs = await getDocsService(req.user.id);
    res.json(docs);
};

export const getDocument = async (req, res) => {
    try {
        const doc = await getDocService(req.params.id, req.user.id);
        res.json(doc);
    } catch {
        res.status(404).json({ error: "No encontrado" });
    }
};

// Genera URL firmada temporal (5 min). Requiere Bearer JWT.
export const requestDownload = async (req, res) => {
    try {
        await getDocService(req.params.id, req.user.id); // valida propiedad
        const token = generateDownloadToken(req.params.id, req.user.id);
        const url = `${req.protocol}://${req.get("host")}/documents/${req.params.id}/file?token=${token}`;
        res.json({ url, expiresIn: 300 });
    } catch {
        res.status(404).json({ error: "No encontrado" });
    }
};

// Sirve el PDF. Usa token firmado en query param (no necesita Bearer).
export const serveFile = async (req, res) => {
    try {
        const { docId, userId } = verifyDownloadToken(req.query.token);
        if (docId !== req.params.id) return res.status(403).json({ error: "Token no corresponde a este documento" });

        const doc = await getDocService(docId, userId);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="documento-${doc.type}-${doc.id.slice(0, 8)}.pdf"`);

        generatePDF(doc, res);
    } catch (e) {
        if (e.name === "TokenExpiredError") return res.status(401).json({ error: "URL expirada. Solicita una nueva." });
        res.status(401).json({ error: "Token inválido" });
    }
};
