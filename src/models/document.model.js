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

        status: {
            type: DataTypes.ENUM("activo", "pendiente", "inactivo"),
            defaultValue: "activo",
            allowNull: false,
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
