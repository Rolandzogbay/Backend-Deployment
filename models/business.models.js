// models/business.models.js
import db from "../config/connect.js";
import { DataTypes } from "sequelize";

const Business = db.define(
    "Business",
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
        owner_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        logo_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        theme_color: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "#f97316",
        },
    },
    {
        timestamps: true,
        freezeTableName: true
    }
);

export default Business;