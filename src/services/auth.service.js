import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { findByCedula, updateTempCode } from "../repositories/patient.repository.js";
import { sendTempCode } from "./email.service.js";

export const requestPasswordService = async (cedula) => {
    const user = await findByCedula(cedula);
    if (!user) throw new Error("Usuario no encontrado");

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(code, 10);
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await updateTempCode(cedula, hashedCode, expires);
    await sendTempCode(user.email, code);
};

export const loginService = async (cedula, code) => {
    const user = await findByCedula(cedula);
    if (!user) throw new Error("Usuario no encontrado");

    if (!user.temp_code || !user.temp_code_expires) throw new Error("Solicita un código primero");

    if (new Date() > user.temp_code_expires) throw new Error("Código expirado");

    const valid = await bcrypt.compare(code, user.temp_code);
    if (!valid) throw new Error("Código incorrecto");

    await updateTempCode(cedula, null, null);

    return jwt.sign({ id: user.id, cedula: user.cedula }, process.env.JWT_SECRET, { expiresIn: "1h" });
};
