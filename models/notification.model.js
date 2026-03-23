import db from "../config/connect.js";
import { DataTypes } from "sequelize";

const Notification = db.define("Notification", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM("low_stock", "out_of_stock", "restock", "system"),
        allowNull: false,
        defaultValue: "system"
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    productId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "Product",
            key: "id"
        },
        onDelete: "SET NULL"
    }
}, {
    timestamps: true,
    freezeTableName: true
});

export default Notification;