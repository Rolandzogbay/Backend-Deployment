// controllers/inventory.controllers.js
import {
    getExpiredInventoryService,
    getExpiringSoonInventoryService,
    getProductBatchesService,
} from "../services/InventoryBatch.services.js";


export const getExpiredInventory = async (req, res) => {
    try {
        const items = await getExpiredInventoryService({
            businessId: req.user.businessId,
        });

        return res.status(200).json({
            success: true,
            data: items,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getExpiringSoonInventory = async (req, res) => {
    try {
        const items = await getExpiringSoonInventoryService({
            businessId: req.user.businessId,
            days: req.query.days || 30,
        });

        return res.status(200).json({
            success: true,
            data: items,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getProductBatches = async (req, res) => {
    try {
        const items = await getProductBatchesService({
            productId: Number(req.params.productId),
            businessId: req.user.businessId,
        });

        return res.status(200).json({
            success: true,
            data: items,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};