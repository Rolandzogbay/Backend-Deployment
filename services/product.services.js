// services/product.services.js
import fs from "fs";
import xlsx from "xlsx";
import db from "../config/connect.js";
import Product from "../models/products.models.js";
import Business from "../models/business.models.js";
import SaleItem from "../models/salesItems.models.js";
import InventoryBatch from "../models/InventoryBatch.model.js";
import { handleProductStockAlert } from "./saleAlert.services.js";
import AppError from "../utils/helpers/app.errors.js";

const cleanString = (value) => {
    if (value === undefined || value === null) return null;
    const v = String(value).trim();
    return v.length ? v : null;
};

const toNumber = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

const toInteger = (value, fallback = 0) => {
    const n = parseInt(value, 10);
    return Number.isInteger(n) ? n : fallback;
};

const normalizeBoolean = (value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") {
        const v = value.trim().toLowerCase();
        return ["true", "1", "yes", "y"].includes(v);
    }
    return false;
};

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

const findProductByIdAndBusiness = async (id, businessId, transaction = null) => {
    const product = await Product.findOne({
        where: { id, businessId },
        transaction,
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

const ensureUniqueProductIdentifiers = async ({
    businessId,
    sku,
    barcode,
    excludeProductId = null,
    transaction = null,
}) => {
    if (sku) {
        const existingSku = await Product.findOne({
            where: {
                businessId,
                sku,
                ...(excludeProductId ? { id: { [db.Sequelize.Op.ne]: excludeProductId } } : {}),
            },
            transaction,
        });

        if (existingSku) {
            throw new AppError("SKU already exists in this business", 400);
        }
    }

    if (barcode) {
        const existingBarcode = await Product.findOne({
            where: {
                businessId,
                barcode,
                ...(excludeProductId ? { id: { [db.Sequelize.Op.ne]: excludeProductId } } : {}),
            },
            transaction,
        });

        if (existingBarcode) {
            throw new AppError("Barcode already exists in this business", 400);
        }
    }
};

const buildProductPayload = (businessId, data) => {
    const payload = {
        name: cleanString(data.name),
        description: cleanString(data.description),
        sku: cleanString(data.sku),
        barcode: cleanString(data.barcode),
        category: cleanString(data.category),
        unit: cleanString(data.unit),
        price: Number(data.price),
        selling_price: Number(data.selling_price),
        stock_quantity: data.stock_quantity !== undefined ? Number(data.stock_quantity) : 0,
        low_stock_threshold:
            data.low_stock_threshold !== undefined ? Number(data.low_stock_threshold) : 10,
        track_expiry: normalizeBoolean(data.track_expiry),
        is_active: data.is_active !== undefined ? normalizeBoolean(data.is_active) : true,
        archived_at: null,
        businessId,
    };

    return payload;
};

const validateBaseProductPayload = (data) => {
    if (!data.name || data.price === undefined || data.selling_price === undefined) {
        throw new AppError("Name, price, and selling_price are required", 400);
    }

    validateProductNumbers(data);
};

const createInitialBatchIfNeeded = async ({
    product,
    data,
    businessId,
    userId,
    transaction,
}) => {
    const stockQuantity = Number(data.stock_quantity || 0);
    const trackExpiry = normalizeBoolean(data.track_expiry);
    const expiryDate = cleanString(data.expiry_date);

    if (stockQuantity <= 0) return;

    if (!trackExpiry) return;

    if (!expiryDate) {
        throw new AppError(
            "expiry_date is required when track_expiry is true and stock is added",
            400
        );
    }

    await InventoryBatch.create(
        {
            batch_number: cleanString(data.batch_number) || `BATCH-${Date.now()}-${product.id}`,
            quantity_received: stockQuantity,
            quantity_remaining: stockQuantity,
            cost_price: Number(data.price),
            expiry_date: expiryDate,
            received_date: cleanString(data.received_date) || new Date(),
            productId: product.id,
            businessId,
            createdBy: userId || null,
        },
        { transaction }
    );
};

const validateImportRow = async ({ row, businessId, transaction = null }) => {
    const prepared = {
        name: cleanString(row.name),
        description: cleanString(row.description),
        sku: cleanString(row.sku),
        barcode: cleanString(row.barcode),
        category: cleanString(row.category),
        unit: cleanString(row.unit),
        price: toNumber(row.price, NaN),
        selling_price: toNumber(row.selling_price, NaN),
        stock_quantity: toInteger(row.stock_quantity, 0),
        low_stock_threshold: toInteger(row.low_stock_threshold, 10),
        track_expiry: normalizeBoolean(row.track_expiry),
        expiry_date: cleanString(row.expiry_date),
        batch_number: cleanString(row.batch_number),
        received_date: cleanString(row.received_date),
    };

    const errors = [];

    if (!prepared.name) errors.push("name is required");
    if (!Number.isFinite(prepared.price) || prepared.price < 0) errors.push("valid price is required");
    if (!Number.isFinite(prepared.selling_price) || prepared.selling_price < 0) errors.push("valid selling_price is required");
    if (!Number.isInteger(prepared.stock_quantity) || prepared.stock_quantity < 0) errors.push("valid stock_quantity is required");
    if (!Number.isInteger(prepared.low_stock_threshold) || prepared.low_stock_threshold < 0) {
        errors.push("valid low_stock_threshold is required");
    }

    if (prepared.track_expiry && prepared.stock_quantity > 0 && !prepared.expiry_date) {
        errors.push("expiry_date is required for expiry-tracked stock");
    }

    if (prepared.sku) {
        const existingSku = await Product.findOne({
            where: { businessId, sku: prepared.sku },
            transaction,
        });
        if (existingSku) errors.push("sku already exists");
    }

    if (prepared.barcode) {
        const existingBarcode = await Product.findOne({
            where: { businessId, barcode: prepared.barcode },
            transaction,
        });
        if (existingBarcode) errors.push("barcode already exists");
    }

    return {
        prepared,
        errors,
        isValid: errors.length === 0,
    };
};

export const createProductService = async (businessId, data, userId = null) => {
    validateBaseProductPayload(data);

    await ensureUniqueProductIdentifiers({
        businessId,
        sku: cleanString(data.sku),
        barcode: cleanString(data.barcode),
    });

    const transaction = await db.transaction();

    try {
        const product = await Product.create(
            buildProductPayload(businessId, data),
            { transaction }
        );

        await createInitialBatchIfNeeded({
            product,
            data,
            businessId,
            userId,
            transaction,
        });

        await transaction.commit();

        await handleProductStockAlert(product);

        return product;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const createBulkProductsService = async (businessId, products, userId = null) => {
    if (!Array.isArray(products) || products.length === 0) {
        throw new AppError("products array is required", 400);
    }

    const transaction = await db.transaction();

    try {
        const results = [];
        const createdProducts = [];

        for (let i = 0; i < products.length; i += 1) {
            const row = products[i];
            const { prepared, errors, isValid } = await validateImportRow({
                row,
                businessId,
                transaction,
            });

            if (!isValid) {
                results.push({
                    rowNumber: i + 1,
                    success: false,
                    errors,
                });
                continue;
            }

            const product = await Product.create(
                {
                    name: prepared.name,
                    description: prepared.description,
                    sku: prepared.sku,
                    barcode: prepared.barcode,
                    category: prepared.category,
                    unit: prepared.unit,
                    price: prepared.price,
                    selling_price: prepared.selling_price,
                    stock_quantity: prepared.stock_quantity,
                    low_stock_threshold: prepared.low_stock_threshold,
                    track_expiry: prepared.track_expiry,
                    is_active: true,
                    archived_at: null,
                    businessId,
                },
                { transaction }
            );

            if (prepared.track_expiry && prepared.stock_quantity > 0) {
                await InventoryBatch.create(
                    {
                        batch_number: prepared.batch_number || `BATCH-${Date.now()}-${product.id}-${i + 1}`,
                        quantity_received: prepared.stock_quantity,
                        quantity_remaining: prepared.stock_quantity,
                        cost_price: prepared.price,
                        expiry_date: prepared.expiry_date,
                        received_date: prepared.received_date || new Date(),
                        productId: product.id,
                        businessId,
                        createdBy: userId || null,
                    },
                    { transaction }
                );
            }

            createdProducts.push(product);

            results.push({
                rowNumber: i + 1,
                success: true,
                productId: product.id,
            });
        }

        await transaction.commit();

        for (const product of createdProducts) {
            await handleProductStockAlert(product);
        }

        return {
            total: products.length,
            created: createdProducts.length,
            failed: results.filter((item) => !item.success).length,
            results,
            products: createdProducts,
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const previewImportProductsService = async (businessId, filePath) => {
    if (!filePath || !fs.existsSync(filePath)) {
        throw new AppError("Import file not found", 400);
    }

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

    const preview = [];

    for (let i = 0; i < rows.length; i += 1) {
        const result = await validateImportRow({
            row: rows[i],
            businessId,
        });

        preview.push({
            rowNumber: i + 1,
            row: rows[i],
            isValid: result.isValid,
            errors: result.errors,
        });
    }

    return {
        totalRows: rows.length,
        validRows: preview.filter((row) => row.isValid).length,
        invalidRows: preview.filter((row) => !row.isValid).length,
        preview,
    };
};

export const confirmImportProductsService = async (businessId, filePath, userId = null) => {
    if (!filePath || !fs.existsSync(filePath)) {
        throw new AppError("Import file not found", 400);
    }

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

    return createBulkProductsService(businessId, rows, userId);
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
        include: [
            {
                model: InventoryBatch,
                as: "batches",
                required: false,
            },
        ],
        order: [[{ model: InventoryBatch, as: "batches" }, "expiry_date", "ASC"]],
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

    if (data.description !== undefined) updates.description = cleanString(data.description);
    if (data.category !== undefined) updates.category = cleanString(data.category);
    if (data.unit !== undefined) updates.unit = cleanString(data.unit);

    if (data.sku !== undefined) {
        const sku = cleanString(data.sku);
        await ensureUniqueProductIdentifiers({
            businessId,
            sku,
            barcode: null,
            excludeProductId: product.id,
        });
        updates.sku = sku;
    }

    if (data.barcode !== undefined) {
        const barcode = cleanString(data.barcode);
        await ensureUniqueProductIdentifiers({
            businessId,
            sku: null,
            barcode,
            excludeProductId: product.id,
        });
        updates.barcode = barcode;
    }

    validateProductNumbers(data);

    if (data.price !== undefined) updates.price = Number(data.price);
    if (data.selling_price !== undefined) updates.selling_price = Number(data.selling_price);
    if (data.stock_quantity !== undefined) updates.stock_quantity = Number(data.stock_quantity);
    if (data.low_stock_threshold !== undefined) {
        updates.low_stock_threshold = Number(data.low_stock_threshold);
    }
    if (data.track_expiry !== undefined) updates.track_expiry = normalizeBoolean(data.track_expiry);

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

export const findProductByBarcodeService = async (businessId, barcode) => {
    if (!barcode) {
        throw new AppError("Barcode is required", 400);
    }

    const product = await Product.findOne({
        where: {
            businessId,
            barcode: String(barcode).trim(),
            is_active: true,
        },
    });

    if (!product) {
        throw new AppError("Product not found for this barcode", 404);
    }

    return product;
};

export const addProductBatchService = async (
    businessId,
    productId,
    data,
    userId = null
) => {
    const transaction = await db.transaction();

    try {
        const product = await findProductByIdAndBusiness(productId, businessId, transaction);

        const quantity_received = Number(data.quantity_received);
        if (!Number.isInteger(quantity_received) || quantity_received <= 0) {
            throw new AppError("Valid quantity_received is required", 400);
        }

        if (product.track_expiry && !cleanString(data.expiry_date)) {
            throw new AppError("expiry_date is required for expiry-tracked products", 400);
        }

        const batch = await InventoryBatch.create(
            {
                batch_number: cleanString(data.batch_number) || `BATCH-${Date.now()}-${product.id}`,
                quantity_received,
                quantity_remaining: quantity_received,
                cost_price: data.cost_price !== undefined ? Number(data.cost_price) : Number(product.price),
                expiry_date: cleanString(data.expiry_date),
                received_date: cleanString(data.received_date) || new Date(),
                productId: product.id,
                businessId,
                createdBy: userId || null,
            },
            { transaction }
        );

        product.stock_quantity = Number(product.stock_quantity) + quantity_received;
        await product.save({ transaction });

        await transaction.commit();

        await handleProductStockAlert(product);

        return batch;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const getExpiredProductsService = async (businessId) => {
    const today = new Date().toISOString().slice(0, 10);

    return InventoryBatch.findAll({
        where: {
            businessId,
            expiry_date: { [db.Sequelize.Op.lt]: today },
            quantity_remaining: { [db.Sequelize.Op.gt]: 0 },
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

export const getExpiringSoonProductsService = async (businessId, days = 30) => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + Number(days));

    return InventoryBatch.findAll({
        where: {
            businessId,
            expiry_date: {
                [db.Sequelize.Op.between]: [
                    start.toISOString().slice(0, 10),
                    end.toISOString().slice(0, 10),
                ],
            },
            quantity_remaining: { [db.Sequelize.Op.gt]: 0 },
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