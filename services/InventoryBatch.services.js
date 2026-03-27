// services/inventory.services.js
import { Op } from "sequelize";
import InventoryBatch from "../models/InventoryBatch.model.js";
import Product from "../models/products.models.js";

export const getExpiredInventoryService = async ({ businessId }) => {
    const today = new Date().toISOString().slice(0, 10);

    return InventoryBatch.findAll({
        where: {
            businessId,
            expiry_date: {
                [Op.lt]: today,
            },
            quantity_remaining: {
                [Op.gt]: 0,
            },
        },
        include: [
            {
                model: Product,
                as: "product",
            },
        ],
        order: [["expiry_date", "ASC"]],
    });
};

export const getExpiringSoonInventoryService = async ({ businessId, days = 30 }) => {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + Number(days));

    const start = today.toISOString().slice(0, 10);
    const end = endDate.toISOString().slice(0, 10);

    return InventoryBatch.findAll({
        where: {
            businessId,
            expiry_date: {
                [Op.between]: [start, end],
            },
            quantity_remaining: {
                [Op.gt]: 0,
            },
        },
        include: [
            {
                model: Product,
                as: "product",
            },
        ],
        order: [["expiry_date", "ASC"]],
    });
};

export const getProductBatchesService = async ({ productId, businessId }) => {
    return InventoryBatch.findAll({
        where: {
            productId,
            businessId,
        },
        order: [["expiry_date", "ASC"], ["createdAt", "ASC"]],
    });
};