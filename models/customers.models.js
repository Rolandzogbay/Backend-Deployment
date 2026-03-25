import db from "../config/connect.js";
import { DataTypes } from "sequelize";

const Customer = db.define(
    "Customer",
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
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },

        phone_number: {
            type: DataTypes.STRING,
            allowNull: true,
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
                fields: ["email", "businessId"],
            },
        ],
    }
);

export default Customer;