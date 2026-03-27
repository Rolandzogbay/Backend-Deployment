import { Op } from "sequelize";
import Product from "../models/products.models.js";
import InventoryBatch from "../models/inventoryBatch.model.js";

export const deductStockFEFOService = async ({
    productId,
    businessId,
    quantity,
    transaction,
}) => {
    const product = await Product.findOne({
        where: { id: productId, businessId },
        transaction,
    });

    if (!product) {
        throw new Error("Product not found.");
    }

    const requestedQty = Number(quantity);

    if (!Number.isInteger(requestedQty) || requestedQty <= 0) {
        throw new Error("Invalid quantity requested.");
    }

    if (Number(product.stock_quantity) < requestedQty) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
    }

    if (!product.track_expiry) {
        product.stock_quantity = Number(product.stock_quantity) - requestedQty;
        await product.save({ transaction });
        return;
    }

    const today = new Date().toISOString().slice(0, 10);

    const batches = await InventoryBatch.findAll({
        where: {
            productId,
            businessId,
            quantity_remaining: {
                [Op.gt]: 0,
            },
            [Op.or]: [
                { expiry_date: null },
                { expiry_date: { [Op.gte]: today } },
            ],
        },
        order: [
            ["expiry_date", "ASC"],
            ["createdAt", "ASC"],
        ],
        transaction,
    });

    let remainingToDeduct = requestedQty;

    for (const batch of batches) {
        if (remainingToDeduct <= 0) break;

        const available = Number(batch.quantity_remaining);
        const deduct = Math.min(available, remainingToDeduct);

        batch.quantity_remaining = available - deduct;
        await batch.save({ transaction });

        remainingToDeduct -= deduct;
    }

    if (remainingToDeduct > 0) {
        throw new Error(`Not enough valid batch stock for product: ${product.name}`);
    }

    product.stock_quantity = Number(product.stock_quantity) - requestedQty;
    await product.save({ transaction });
};