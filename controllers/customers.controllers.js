import {
    createCustomerService,
    getCustomersByBusinessService,
    getCustomerByIdService,
    updateCustomerService,
    deleteCustomerService
} from "../services/customers.services.js";

export const createCustomer = async (req, res) => {
    try {
        const customer = await createCustomerService(req.user.businessId, req.body);

        return res.status(201).json({
            message: "Customer created successfully",
            customer
        });
    } catch (error) {
        console.error("Error creating customer:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error"
        });
    }
};

export const getCustomersByBusiness = async (req, res) => {
    try {
        const customers = await getCustomersByBusinessService(req.user.businessId);

        return res.status(200).json(customers);
    } catch (error) {
        console.error("Error fetching customers:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error"
        });
    }
};

export const getCustomerById = async (req, res) => {
    try {
        const customer = await getCustomerByIdService(req.params.id, req.user.businessId);

        return res.status(200).json(customer);
    } catch (error) {
        console.error("Error fetching customer:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error"
        });
    }
};

export const updateCustomer = async (req, res) => {
    try {
        const customer = await updateCustomerService(
            req.params.id,
            req.user.businessId,
            req.body
        );

        return res.status(200).json({
            message: "Customer updated successfully",
            customer
        });
    } catch (error) {
        console.error("Error updating customer:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error"
        });
    }
};

export const deleteCustomer = async (req, res) => {
    try {
        const result = await deleteCustomerService(req.params.id, req.user.businessId);

        return res.status(200).json(result);
    } catch (error) {
        console.error("Error deleting customer:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error"
        });
    }
};