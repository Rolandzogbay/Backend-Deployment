import db from "../config/connect.js";
import { DataTypes } from "sequelize";

const PurchaseOrderItem = db.define("PurchaseOrderItem", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    unit_cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    sub_total_cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    purchaseOrderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "PurchaseOrder",
            key: "id"
        },
        onDelete: "CASCADE"
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Product",
            key: "id"
        },
        onDelete: "CASCADE"
    }
}, {
    timestamps: true,
    freezeTableName: true
});

export default PurchaseOrderItem;