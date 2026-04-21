import { findByPatient, findByIdAndPatient, createDoc } from "../repositories/document.repository.js";
import { findByCedula } from "../repositories/patient.repository.js";

export const getDocsService = (userId) => findByPatient(userId);

export const getDocService = async (id, userId) => {
    const doc = await findByIdAndPatient(id, userId);
    if (!doc) throw new Error("No encontrado");
    return doc;
};

export const createDocService = async (cedula, type, content) => {
    const patient = await findByCedula(cedula);
    if (!patient) throw new Error("Paciente no encontrado");

    return createDoc({
        patient_id: patient.id,
        type,
        metadata: content,
    });
};
