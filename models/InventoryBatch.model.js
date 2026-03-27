// models/inventoryBatch.models.js
import db from "../config/connect.js";
import { DataTypes } from "sequelize";

const InventoryBatch = db.define(
    "InventoryBatch",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        batch_number: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        quantity_received: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        quantity_remaining: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cost_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        expiry_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        received_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Product",
                key: "id",
            },
            onDelete: "CASCADE",
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
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "User",
                key: "id",
            },
            onDelete: "SET NULL",
        },
    },
    {
        timestamps: true,
        freezeTableName: true,
    }
);

export default InventoryBatch;