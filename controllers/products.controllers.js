// controllers/products.controllers.js
import {
    createProductService,
    getProductsByBusinessService,
    getProductByIdService,
    getAllProductsService,
    updateProductService,
    archiveProductService,
    restoreProductService,
    permanentlyDeleteProductService,
} from "../services/product.services.js"

export const createProduct = async (req, res) => {
    try {
        const product = await createProductService(req.user.businessId, req.body);

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