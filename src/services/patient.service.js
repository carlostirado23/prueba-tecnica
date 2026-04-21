import { createPatient } from "../repositories/patient.repository.js";

export const createPatientService = (cedula, email) => createPatient({ cedula, email });
