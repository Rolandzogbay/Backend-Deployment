// controllers/products.controllers.js
import fs from "fs";
import {
    createProductService,
    createBulkProductsService,
    previewImportProductsService,
    confirmImportProductsService,
    getProductsByBusinessService,
    getProductByIdService,
    getAllProductsService,
    updateProductService,
    archiveProductService,
    restoreProductService,
    permanentlyDeleteProductService,
    findProductByBarcodeService,
    addProductBatchService,
    getExpiredProductsService,
    getExpiringSoonProductsService,
} from "../services/product.services.js";

export const createProduct = async (req, res) => {
    try {
        const product = await createProductService(
            req.user.businessId,
            req.body,
            req.user.userId
        );

        return res.status(201).json({
            message: "Product created successfully",
            product,
        });
    } catch (error) {
        console.error("Error creating product:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const createBulkProducts = async (req, res) => {
    try {
        const result = await createBulkProductsService(
            req.user.businessId,
            req.body.products,
            req.user.userId
        );

        return res.status(201).json({
            message: "Products processed successfully",
            ...result,
        });
    } catch (error) {
        console.error("Error bulk creating products:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const previewImportProducts = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload a CSV or Excel file" });
        }

        const result = await previewImportProductsService(
            req.user.businessId,
            req.file.path
        );

        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(200).json({
            message: "Import preview generated successfully",
            ...result,
        });
    } catch (error) {
        console.error("Error previewing import:", error);

        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const confirmImportProducts = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload a CSV or Excel file" });
        }

        const result = await confirmImportProductsService(
            req.user.businessId,
            req.file.path,
            req.user.userId
        );

        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(201).json({
            message: "Products imported successfully",
            ...result,
        });
    } catch (error) {
        console.error("Error confirming import:", error);

        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const includeArchived = req.query.includeArchived === "true";
        const products = await getAllProductsService(req.user, includeArchived);
        return res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getProductsByBusiness = async (req, res) => {
    try {
        const includeArchived = req.query.includeArchived === "true";
        const products = await getProductsByBusinessService(
            req.user.businessId,
            includeArchived
        );

        return res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await getProductByIdService(req.params.id, req.user.businessId);

        return res.status(200).json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const findProductByBarcode = async (req, res) => {
    try {
        const product = await findProductByBarcodeService(
            req.user.businessId,
            req.params.barcode
        );

        return res.status(200).json(product);
    } catch (error) {
        console.error("Error fetching product by barcode:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await updateProductService(
            req.params.id,
            req.user.businessId,
            req.body
        );

        return res.status(200).json({
            message: "Product updated successfully",
            product,
        });
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const archiveProduct = async (req, res) => {
    try {
        const result = await archiveProductService(req.params.id, req.user.businessId);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error archiving product:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const restoreProduct = async (req, res) => {
    try {
        const result = await restoreProductService(req.params.id, req.user.businessId);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error restoring product:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const permanentlyDeleteProduct = async (req, res) => {
    try {
        const result = await permanentlyDeleteProductService(
            req.params.id,
            req.user.businessId
        );

        return res.status(200).json(result);
    } catch (error) {
        console.error("Error permanently deleting product:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const addProductBatch = async (req, res) => {
    try {
        const batch = await addProductBatchService(
            req.user.businessId,
            req.params.id,
            req.body,
            req.user.userId
        );

        return res.status(201).json({
            message: "Stock batch added successfully",
            batch,
        });
    } catch (error) {
        console.error("Error adding stock batch:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const getExpiredProducts = async (req, res) => {
    try {
        const items = await getExpiredProductsService(req.user.businessId);
        return res.status(200).json(items);
    } catch (error) {
        console.error("Error fetching expired products:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const getExpiringSoonProducts = async (req, res) => {
    try {
        const items = await getExpiringSoonProductsService(
            req.user.businessId,
            req.query.days || 30
        );
        return res.status(200).json(items);
    } catch (error) {
        console.error("Error fetching expiring soon products:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};