import { sequelize } from "../config/database.js";

import "../models/document.model.js";
import "../models/patient.model.js";

export const initDB = async () => {
    try {
        if (process.env.MIGRATE === "true") {
            await sequelize.sync({ alter: true });
            console.log("Migración ejecutada");
        } else {
            console.log("Migración desactivada");
        }
    } catch (err) {
        console.error("Error DB:", err);
    }
};
