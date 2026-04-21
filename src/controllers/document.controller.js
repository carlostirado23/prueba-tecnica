import { getDocsService, getDocService, downloadDocService } from "../services/document.service.js";

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

export const downloadDocument = async (req, res) => {
    try {
        const { filePath, fileName } = await downloadDocService(req.params.id, req.user.id);
        res.download(filePath, fileName);
    } catch {
        res.status(404).json({ error: "No encontrado" });
    }
};
