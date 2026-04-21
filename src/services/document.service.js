import path from "path";
import { findByPatient, findByIdAndPatient, createDoc } from "../repositories/document.repository.js";

export const getDocsService = (userId) => findByPatient(userId);

export const getDocService = async (id, userId) => {
    const doc = await findByIdAndPatient(id, userId);
    if (!doc) throw new Error("No encontrado");
    return doc;
};

export const createDocService = async (cedula, type, file, patientRepo) => {
    const patient = await patientRepo(cedula);
    if (!patient) throw new Error("Paciente no encontrado");

    return createDoc({
        patient_id: patient.id,
        type,
        file_url: path.resolve(file.path),
        metadata: { nombre: file.originalname, size: file.size },
    });
};

export const downloadDocService = async (id, userId) => {
    const doc = await findByIdAndPatient(id, userId);
    if (!doc) throw new Error("No encontrado");
    return { filePath: doc.file_url, fileName: doc.metadata?.nombre || "documento.pdf" };
};
