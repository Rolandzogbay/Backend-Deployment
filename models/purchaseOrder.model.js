import db from "../config/connect.js";
import { DataTypes } from "sequelize";

const PurchaseOrder = db.define("PurchaseOrder", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    status: {
        type: DataTypes.ENUM("pending", "received", "cancelled"),
        allowNull: false,
        defaultValue: "pending"
    },
    total_cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    expected_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    businessId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Business",
            key: "id"
        },
        onDelete: "CASCADE"
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "User",
            key: "id"
        },
        onDelete: "CASCADE"
    },
    supplierId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "Supplier",
            key: "id",
        },
        onDelete: "SET NULL",
    },

}, {
    timestamps: true,
    freezeTableName: true
});

export default PurchaseOrder;