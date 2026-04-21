import { createDocService } from "../services/document.service.js";
import { createPatientService } from "../services/patient.service.js";
import { findByCedula } from "../repositories/patient.repository.js";

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
        if (!req.file) return res.status(400).json({ error: "Archivo PDF requerido" });
        const { cedula, type } = req.body;
        if (!cedula || !type) return res.status(400).json({ error: "cedula y type requeridos" });

        const doc = await createDocService(cedula, type, req.file, findByCedula);
        res.status(201).json(doc);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};
