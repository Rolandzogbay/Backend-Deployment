import {
    createPurchaseOrderService,
    getPurchaseOrdersByBusinessService,
    getPurchaseOrderByIdService,
    getAllPurchaseOrdersService,
    receivePurchaseOrderService,
    cancelPurchaseOrderService
} from "../services/purchaseOrder.services.js";

export const createPurchaseOrder = async (req, res) => {
    try {
        const result = await createPurchaseOrderService({
            businessId: req.user.businessId,
            userId: req.user.userId,
            supplier_name: req.body.supplier_name,
            expected_date: req.body.expected_date,
            notes: req.body.notes,
            items: req.body.items
        });

        return res.status(201).json({
            message: "Purchase order created successfully",
            ...result
        });
    } catch (error) {
        console.error("Error creating purchase order:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error"
        });
    }
};

export const getPurchaseOrdersByBusiness = async (req, res) => {
    try {
        const purchaseOrders = await getPurchaseOrdersByBusinessService(req.user.businessId);
        return res.status(200).json(purchaseOrders);
    } catch (error) {
        console.error("Error fetching purchase orders:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error"
        });
    }
};

export const getAllPurchaseOrders = async (req, res) => {
  try {
    const orders = await getAllPurchaseOrdersService(req.user);
    return res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getPurchaseOrderById = async (req, res) => {
    try {
        const purchaseOrder = await getPurchaseOrderByIdService(
            req.params.id,
            req.user.businessId
        );
        return res.status(200).json(purchaseOrder);
    } catch (error) {
        console.error("Error fetching purchase order:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error"
        });
    }
};

export const receivePurchaseOrder = async (req, res) => {
    try {
        const result = await receivePurchaseOrderService(
            req.params.id,
            req.user.businessId
        );
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error receiving purchase order:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error"
        });
    }
};

export const cancelPurchaseOrder = async (req, res) => {
    try {
        const result = await cancelPurchaseOrderService(
            req.params.id,
            req.user.businessId
        );
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error cancelling purchase order:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error"
        });
    }
};