import db from "../config/connect.js";
import Sale from "../models/sales.model.js";
import SaleItem from "../models/salesItems.models.js";
import Product from "../models/products.models.js";
import Business from "../models/business.models.js";
import user from "../models/user.models.js";
import { findOrCreateCustomerService } from "./customers.services.js";
import { handleProductStockAlert } from "./saleAlert.services.js";
import AppError from "../utils/helpers/app.errors.js";


export const createSaleService = async ({
    businessId,
    userId,
    payment_method,
    customer_id,
    customer_name,
    customer_email,
    customer_phone_number,
    items
}) => {
    const transaction = await db.transaction();

    try {
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new AppError("No items provided for this sale", 400);
        }

        let customerIdToUse = customer_id;

        if (!customerIdToUse) {
            if (!customer_name || !customer_email) {
                throw new AppError(
                    "customer_id or customer_name and customer_email are required",
                    400
                );
            }

            const customer = await findOrCreateCustomerService(businessId, {
                name: customer_name,
                email: customer_email,
                phone_number: customer_phone_number
            });

            customerIdToUse = customer.id;
        }

        const sale = await Sale.create(
            {
                businessId,
                userId,
                customer_id: customerIdToUse,
                payment_method: payment_method || "cash",
                total_price: 0
            },
            { transaction }
        );

        let total_price = 0;
        const createdItems = [];
        const touchedProducts = [];

        for (const item of items) {
            const { productId, quantity } = item;

            if (!productId || !quantity || Number(quantity) <= 0) {
                throw new AppError("Each item must have valid productId and quantity", 400);
            }

            const product = await Product.findOne({
                where: { id: productId, businessId },
                transaction
            });

            if (!product) {
                throw new AppError(`Product ${productId} not found`, 404);
            }

            if (Number(product.stock_quantity) < Number(quantity)) {
                throw new AppError(`Insufficient stock for ${product.name}`, 400);
            }

            const unit_price = Number(product.selling_price || product.price);
            const sub_total_price = unit_price * Number(quantity);

            const saleItem = await SaleItem.create(
                {
                    saleId: sale.id,
                    productId: product.id,
                    quantity: Number(quantity),
                    unit_price,
                    sub_total_price
                },
                { transaction }
            );

            product.stock_quantity = Number(product.stock_quantity) - Number(quantity);
            await product.save({ transaction });

            touchedProducts.push(product);
            total_price += sub_total_price;
            createdItems.push(saleItem);
        }

        sale.total_price = total_price;
        await sale.save({ transaction });

        await transaction.commit();

        for (const product of touchedProducts) {
            await handleProductStockAlert(product);
        }

        return {
            sale,
            items: createdItems
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};
export const getAllSalesService = async (reqUser) => {
    const whereClause =
        reqUser.role === "system_admin"
            ? {}
            : { businessId: reqUser.businessId };

    return await Sale.findAll({
        where: whereClause,
        include: [
            {
                model: SaleItem,
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
                attributes: ["id", "name", "email"],
            },
        ],
        order: [["createdAt", "DESC"]],
    });
};

export const getBusinessSalesService = async (businessId) => {
    const sales = await Sale.findAll({
        where: { businessId },
        include: [
            {
                model: SaleItem,
                as: "items",
                include: [
                    {
                        model: Product,
                        as: "product",
                        attributes: ["id", "name", "selling_price", "price"]
                    }
                ]
            }
        ],
        order: [["createdAt", "DESC"]]
    });

    return sales;
};

export const getSaleByIdService = async (saleId, businessId) => {
    const sale = await Sale.findOne({
        where: { id: saleId, businessId },
        include: [
            {
                model: SaleItem,
                as: "items",
                include: [
                    {
                        model: Product,
                        as: "product",
                        attributes: ["id", "name", "selling_price", "price"]
                    }
                ]
            }
        ]
    });

    if (!sale) {
        throw new AppError("Sale not found", 404);
    }

    return sale;
};

export const updateSaleService = async (saleId, businessId, data) => {
    const sale = await Sale.findOne({
        where: { id: saleId, businessId }
    });

    if (!sale) {
        throw new AppError("Sale not found", 404);
    }

    if (data.payment_method) {
        sale.payment_method = data.payment_method;
    }

    await sale.save();

    return sale;
};

export const deleteSaleService = async (saleId, businessId) => {
    const transaction = await db.transaction();

    try {
        const sale = await Sale.findOne({
            where: { id: saleId, businessId },
            include: [
                {
                    model: SaleItem,
                    as: "items"
                }
            ],
            transaction
        });

        if (!sale) {
            throw new AppError("Sale not found", 404);
        }

        for (const item of sale.items) {
            const product = await Product.findOne({
                where: { id: item.productId, businessId },
                transaction
            });

            if (product) {
                product.stock_quantity = Number(product.stock_quantity) + Number(item.quantity);
                await product.save({ transaction });
            }
        }

        await SaleItem.destroy({
            where: { saleId: sale.id },
            transaction
        });

        await sale.destroy({ transaction });

        await transaction.commit();

        return { message: "Sale deleted successfully" };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};