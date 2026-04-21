import { Patient } from "../models/patient.model.js";

export const findByCedula = (cedula) => Patient.findOne({ where: { cedula } });

export const createPatient = (data) => Patient.create(data);

export const updateTempCode = (cedula, code, expires) =>
    Patient.update({ temp_code: code, temp_code_expires: expires }, { where: { cedula } });
