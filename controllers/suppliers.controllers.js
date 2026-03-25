import {
    createSupplierService,
    getSuppliersByBusinessService,
    getSupplierByIdService,
    updateSupplierService,
    deleteSupplierService,
} from "../services/supliers.services.js";

export const createSupplier = async (req, res) => {
    try {
        const supplier = await createSupplierService(req.user.businessId, req.body);

        return res.status(201).json({
            message: "Supplier created successfully",
            supplier,
        });
    } catch (error) {
        console.error("Error creating supplier:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const getSuppliersByBusiness = async (req, res) => {
    try {
        const suppliers = await getSuppliersByBusinessService(req.user.businessId);

        return res.status(200).json(suppliers);
    } catch (error) {
        console.error("Error fetching suppliers:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const getSupplierById = async (req, res) => {
    try {
        const supplier = await getSupplierByIdService(req.user.businessId, req.params.id);

        return res.status(200).json(supplier);
    } catch (error) {
        console.error("Error fetching supplier:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const updateSupplier = async (req, res) => {
    try {
        const supplier = await updateSupplierService(
            req.user.businessId,
            req.params.id,
            req.body
        );

        return res.status(200).json({
            message: "Supplier updated successfully",
            supplier,
        });
    } catch (error) {
        console.error("Error updating supplier:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const deleteSupplier = async (req, res) => {
    try {
        await deleteSupplierService(req.user.businessId, req.params.id);

        return res.status(200).json({
            message: "Supplier deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting supplier:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};