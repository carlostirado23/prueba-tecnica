import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Patient = sequelize.define(
  "Patient",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    cedula: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },

    temp_code: {
      type: DataTypes.STRING,
    },
    temp_code_expires: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "pacientes", 
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);