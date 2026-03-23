import db from '../config/connect.js';
import { DataTypes } from 'sequelize';

const SaleItem = db.define('SaleItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    sub_total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    saleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Sale',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Product',
            key: 'id'
        },
        onDelete: 'RESTRICT'
    }
}, {
    timestamps: true,
    freezeTableName: true
});

SaleItem.associate = (models) => {
    SaleItem.belongsTo(models.Sale, {
        foreignKey: 'saleId'
    })

    SaleItem.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product'
    })
}

export default SaleItem;