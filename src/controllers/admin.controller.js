import { createDocService } from "../services/document.service.js";
import { createPatientService } from "../services/patient.service.js";
import { getSupportedTypes } from "../services/pdf.service.js";

export const createPatient = async (req, res) => {
    try {
        const { cedula, email } = req.body;
        if (!cedula || !email) return res.status(400).json({ error: "cedula y email requeridos" });
        const patient = await createPatientService(cedula, email);
        res.status(201).json(patient);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

export const createDocument = async (req, res) => {
    try {
        const { cedula, type, content } = req.body;
        if (!cedula || !type || !content) return res.status(400).json({ error: "cedula, type y content requeridos" });

        const supported = getSupportedTypes();
        if (!supported.includes(type)) {
            return res.status(400).json({ error: `Tipo inválido. Soportados: ${supported.join(", ")}` });
        }

        const doc = await createDocService(cedula, type, content);
        res.status(201).json(doc);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};
