import { Document } from "../models/document.model.js";

export const findByPatient = (patient_id) => Document.findAll({ where: { patient_id } });

export const findByIdAndPatient = (id, patient_id) => Document.findOne({ where: { id, patient_id } });

export const createDoc = (data) => Document.create(data);
