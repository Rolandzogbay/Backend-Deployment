import db from "../config/connect.js";
import { DataTypes } from "sequelize";

const Supplier = db.define(
  "Supplier",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
      validate: {
        isEmail: true,
      },
    },

    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },

    contact_person: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },

    businessId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Business",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    timestamps: true,
    freezeTableName: true,
    indexes: [
      {
        unique: true,
        fields: ["name", "businessId"],
      },
    ],
  }
);

export default Supplier;