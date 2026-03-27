import express from "express";
import { authMiddleware } from "../utils/middlewares/authMiddleware.js";
import { roleMiddleware } from "../utils/middlewares/roleMiddleware.js";
import {
    getExpiredInventory,
    getExpiringSoonInventory,
    getProductBatches,
} from "../controllers/inventory.controllers.js";

const inventory = express.Router();

inventory.use(authMiddleware);
inventory.use(roleMiddleware("business_admin", "system_admin"))

inventory.get("/expired", getExpiredInventory);
inventory.get("/expiring-soon", getExpiringSoonInventory);
inventory.get("/products/:productId/batches", getProductBatches);

export default inventory;