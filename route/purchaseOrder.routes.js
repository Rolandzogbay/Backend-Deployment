import { Router } from "express";
import { authMiddleware } from "../utils/middlewares/authMiddleware.js";
import { roleMiddleware } from '../utils/middlewares/roleMiddleware.js'
import {
    createPurchaseOrder,
    getPurchaseOrdersByBusiness,
    getPurchaseOrderById,
    getAllPurchaseOrders,
    receivePurchaseOrder,
    cancelPurchaseOrder
} from "../controllers/purchaseOrder.controller.js";

const purchaseOrderRoute = Router();

purchaseOrderRoute.use(authMiddleware);
purchaseOrderRoute.use(roleMiddleware('business_admin', 'system_admin'))

purchaseOrderRoute.post("/", createPurchaseOrder);
purchaseOrderRoute.get("/", getPurchaseOrdersByBusiness);
purchaseOrderRoute.get("/all-purchaseorders", getAllPurchaseOrders)
purchaseOrderRoute.get("/:id", getPurchaseOrderById);
purchaseOrderRoute.patch("/:id/receive", receivePurchaseOrder);
purchaseOrderRoute.patch("/:id/cancel", cancelPurchaseOrder);

export default purchaseOrderRoute;