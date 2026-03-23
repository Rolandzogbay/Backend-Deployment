import db from "../config/connect.js";
import PurchaseOrder from "../models/purchaseOrder.model.js";
import Business from "../models/business.models.js";
import user from "../models/user.models.js";
import PurchaseOrderItem from "../models/purchaseOrderItem.model.js";
import Product from "../models/products.models.js";
import AppError from "../utils/helpers/app.errors.js";


export const createPurchaseOrderService = async ({
    businessId,
    userId,
    supplier_name,
    expected_date,
    notes,
    items
}) => {
    const transaction = await db.transaction();

    try {
        if (!supplier_name?.trim()) {
            throw new AppError("Supplier name is required", 400);
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new AppError("At least one purchase item is required", 400);
        }

        const purchaseOrder = await PurchaseOrder.create(
            {
                supplier_name: supplier_name.trim(),
                expected_date: expected_date || null,
                notes: notes || null,
                businessId,
                userId,
                total_cost: 0
            },
            { transaction }
        );

        let total_cost = 0;
        const createdItems = [];

        for (const item of items) {
            const { productId, quantity, unit_cost } = item;

            if (!productId || Number(quantity) <= 0 || Number(unit_cost) < 0) {
                throw new AppError("Each item must have valid productId, quantity, and unit_cost", 400);
            }

            const product = await Product.findOne({
                where: { id: productId, businessId },
                transaction
            });

            if (!product) {
                throw new AppError(`Product ${productId} not found`, 404);
            }

            const sub_total_cost = Number(quantity) * Number(unit_cost);

            const poItem = await PurchaseOrderItem.create(
                {
                    purchaseOrderId: purchaseOrder.id,
                    productId: product.id,
                    quantity: Number(quantity),
                    unit_cost: Number(unit_cost),
                    sub_total_cost
                },
                { transaction }
            );

            total_cost += sub_total_cost;
            createdItems.push(poItem);
        }

        purchaseOrder.total_cost = total_cost;
        await purchaseOrder.save({ transaction });

        await transaction.commit();

        return {
            purchaseOrder,
            items: createdItems
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const getAllPurchaseOrdersService = async (reqUser) => {
    const whereClause =
        reqUser.role === "system_admin"
            ? {}
            : { businessId: reqUser.businessId };

    return await PurchaseOrder.findAll({
        where: whereClause,
        include: [
            {
                model: PurchaseOrderItem,
                as: "items",
                include: [
                    {
                        model: Product,
                        as: "product",
                        attributes: ["id", "name"],
                    },
                ],
            },
            {
                model: Business,
                as: "business",
                attributes: ["id", "name"],
            },
            {
                model: user,
                as: "user",
                attributes: ["id", "name"],
            },
        ],
        order: [["createdAt", "DESC"]],
    });
};

export const getPurchaseOrdersByBusinessService = async (businessId) => {
    return await PurchaseOrder.findAll({
        where: { businessId },
        include: [
            {
                model: PurchaseOrderItem,
                as: "items",
                include: [
                    {
                        model: Product,
                        as: "product",
                        attributes: ["id", "name"]
                    }
                ]
            }
        ],
        order: [["createdAt", "DESC"]]
    });
};

export const getPurchaseOrderByIdService = async (id, businessId) => {
    const po = await PurchaseOrder.findOne({
        where: { id, businessId },
        include: [
            {
                model: PurchaseOrderItem,
                as: "items",
                include: [
                    {
                        model: Product,
                        as: "product",
                        attributes: ["id", "name"]
                    }
                ]
            }
        ]
    });

    if (!po) {
        throw new AppError("Purchase order not found", 404);
    }

    return po;
};

export const receivePurchaseOrderService = async (id, businessId) => {
    const transaction = await db.transaction();

    try {
        const po = await PurchaseOrder.findOne({
            where: { id, businessId },
            include: [
                {
                    model: PurchaseOrderItem,
                    as: "items"
                }
            ],
            transaction
        });

        if (!po) {
            throw new AppError("Purchase order not found", 404);
        }

        if (po.status === "received") {
            throw new AppError("Purchase order already received", 400);
        }

        if (po.status === "cancelled") {
            throw new AppError("Cancelled purchase order cannot be received", 400);
        }

        for (const item of po.items) {
            const product = await Product.findOne({
                where: { id: item.productId, businessId },
                transaction
            });

            if (product) {
                product.stock_quantity = Number(product.stock_quantity || 0) + Number(item.quantity || 0);
                await product.save({ transaction });
            }
        }

        po.status = "received";
        await po.save({ transaction });

        await transaction.commit();

        return {
            message: "Purchase order received successfully",
            purchaseOrder: po
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const cancelPurchaseOrderService = async (id, businessId) => {
    const po = await PurchaseOrder.findOne({
        where: { id, businessId }
    });

    if (!po) {
        throw new AppError("Purchase order not found", 404);
    }

    if (po.status === "received") {
        throw new AppError("Received purchase order cannot be cancelled", 400);
    }

    po.status = "cancelled";
    await po.save();

    return {
        message: "Purchase order cancelled successfully",
        purchaseOrder: po
    };
};