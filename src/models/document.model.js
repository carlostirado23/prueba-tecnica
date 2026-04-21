import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Patient } from "./patient.model.js";

export const Document = sequelize.define(
    "Document",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },

        type: {
            type: DataTypes.STRING,
        },

        file_url: {
            type: DataTypes.TEXT,
        },

        metadata: {
            type: DataTypes.JSON,
        },
    },
    {
        tableName: "documentos",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
    },
);

Document.belongsTo(Patient, {
    foreignKey: "patient_id",
});
