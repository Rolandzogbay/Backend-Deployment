import {
    createSaleService,
    getBusinessSalesService,
    getSaleByIdService,
    updateSaleService,
    deleteSaleService,
    getAllSalesService
} from "../services/sales.services.js";

export const createSale = async (req, res) => {
    try {
        const result = await createSaleService({
            businessId: req.user.businessId,
            userId: req.user.userId,
            payment_method: req.body.payment_method,
            customer_id: req.body.customer_id,
            customer_name: req.body.customer_name,
            customer_email: req.body.customer_email,
            customer_phone_number: req.body.customer_phone_number,
            items: req.body.items
        });

        return res.status(201).json({
            message: "Sale created successfully",
            ...result
        });
    } catch (error) {
        console.error("Error creating sale:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error"
        });
    }
};

export const getBusinessSales = async (req, res) => {
    try {
        const sales = await getBusinessSalesService(req.user.businessId);
        return res.status(200).json(sales);
    } catch (error) {
        console.error("Error fetching sales:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error"
        });
    }
};

export const getSales = async (req, res) => {
    try {
        const sale = await getSaleByIdService(req.params.id, req.user.businessId);
        return res.status(200).json(sale);
    } catch (error) {
        console.error("Error fetching sale:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error"
        });
    }
};

export const getAllSales = async (req, res) => {
  try {
    const sales = await getAllSalesService(req.user);
    return res.status(200).json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateSale = async (req, res) => {
    try {
        const sale = await updateSaleService(
            req.params.id,
            req.user.businessId,
            req.body
        );

        return res.status(200).json(sale);
    } catch (error) {
        console.error("Error updating sale:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error"
        });
    }
};

export const deleteSale = async (req, res) => {
    try {
        const result = await deleteSaleService(req.params.id, req.user.businessId);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error deleting sale:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error"
        });
    }
};