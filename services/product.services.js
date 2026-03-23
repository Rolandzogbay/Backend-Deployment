// services/product.services.js
import Product from "../models/products.models.js";
import Business from "../models/business.models.js";
import SaleItem from "../models/salesItems.models.js";
import { handleProductStockAlert } from "./saleAlert.services.js";
import AppError from '../utils/helpers/app.errors.js'

const validateProductNumbers = (data) => {
    if (data.price !== undefined && Number(data.price) < 0) {
        throw new AppError("Price cannot be negative", 400);
    }

    if (data.selling_price !== undefined && Number(data.selling_price) < 0) {
        throw new AppError("Selling price cannot be negative", 400);
    }

    if (data.stock_quantity !== undefined && Number(data.stock_quantity) < 0) {
        throw new AppError("Stock quantity cannot be negative", 400);
    }

    if (data.low_stock_threshold !== undefined && Number(data.low_stock_threshold) < 0) {
        throw new AppError("Low stock threshold cannot be negative", 400);
    }
};

const buildScopedWhereClause = (reqUser, includeArchived = false) => {
    const whereClause =
        reqUser.role === "system_admin"
            ? {}
            : { businessId: reqUser.businessId };

    if (!includeArchived) {
        whereClause.is_active = true;
    }

    return whereClause;
};

const findProductByIdAndBusiness = async (id, businessId) => {
    const product = await Product.findOne({
        where: { id, businessId },
    });

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    return product;
};

const ensureProductNotSold = async (productId) => {
    const salesCount = await SaleItem.count({
        where: { productId },
    });

    if (salesCount > 0) {
        throw new AppError(
            "This product has sales history and cannot be permanently deleted. Archive it instead.",
            400
        );
    }
};

export const createProductService = async (businessId, data) => {
    const {
        name,
        description,
        price,
        selling_price,
        stock_quantity,
        low_stock_threshold,
    } = data;

    if (!name || price === undefined || selling_price === undefined) {
        throw new AppError("Name, price, and selling_price are required", 400);
    }

    validateProductNumbers({
        price,
        selling_price,
        stock_quantity,
        low_stock_threshold,
    });

    const product = await Product.create({
        name: String(name).trim(),
        description: description || null,
        price: Number(price),
        selling_price: Number(selling_price),
        stock_quantity: stock_quantity !== undefined ? Number(stock_quantity) : 0,
        low_stock_threshold:
            low_stock_threshold !== undefined ? Number(low_stock_threshold) : 10,
        is_active: true,
        archived_at: null,
        businessId,
    });

    await handleProductStockAlert(product);

    return product;
};

export const getProductsByBusinessService = async (
    businessId,
    includeArchived = false
) => {
    const whereClause = { businessId };

    if (!includeArchived) {
        whereClause.is_active = true;
    }

    return await Product.findAll({
        where: whereClause,
        order: [["createdAt", "DESC"]],
    });
};

export const getAllProductsService = async (reqUser, includeArchived = false) => {
    const whereClause = buildScopedWhereClause(reqUser, includeArchived);

    return await Product.findAll({
        where: whereClause,
        include: [
            {
                model: Business,
                as: "business",
                attributes: ["id", "name"],
            },
        ],
        order: [["createdAt", "DESC"]],
    });
};

export const getProductByIdService = async (id, businessId) => {
    const product = await Product.findOne({
        where: { id, businessId },
    });

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    return product;
};

export const updateProductService = async (id, businessId, data) => {
    const product = await findProductByIdAndBusiness(id, businessId);

    const updates = {};

    if (data.name !== undefined) {
        if (!String(data.name).trim()) {
            throw new AppError("Product name cannot be empty", 400);
        }
        updates.name = String(data.name).trim();
    }

    if (data.description !== undefined) {
        updates.description = data.description;
    }

    validateProductNumbers(data);

    if (data.price !== undefined) {
        updates.price = Number(data.price);
    }

    if (data.selling_price !== undefined) {
        updates.selling_price = Number(data.selling_price);
    }

    if (data.stock_quantity !== undefined) {
        updates.stock_quantity = Number(data.stock_quantity);
    }

    if (data.low_stock_threshold !== undefined) {
        updates.low_stock_threshold = Number(data.low_stock_threshold);
    }

    await product.update(updates);
    await handleProductStockAlert(product);

    return product;
};

export const archiveProductService = async (id, businessId) => {
    const product = await findProductByIdAndBusiness(id, businessId);

    if (!product.is_active) {
        throw new AppError("Product is already archived", 400);
    }

    await product.update({
        is_active: false,
        archived_at: new Date(),
    });

    return {
        message: "Product archived successfully",
        product,
    };
};

export const restoreProductService = async (id, businessId) => {
    const product = await findProductByIdAndBusiness(id, businessId);

    if (product.is_active) {
        throw new AppError("Product is already active", 400);
    }

    await product.update({
        is_active: true,
        archived_at: null,
    });

    return {
        message: "Product restored successfully",
        product,
    };
};

export const permanentlyDeleteProductService = async (id, businessId) => {
    const product = await findProductByIdAndBusiness(id, businessId);

    await ensureProductNotSold(product.id);

    await product.destroy();

    return { message: "Product permanently deleted successfully" };
};