// models/user.models.js
import db from "../config/connect.js";
import { DataTypes } from "sequelize";

const User = db.define(
    "User",
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
            unique: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        avatar_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "employee",
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "active",
        },
        email_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        email_verification_token: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email_verify_expires: {
            type: DataTypes.DATE,
            allowNull: true,
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
        freezeTableName: true
    }
);

export default User;