import { Router } from "express";
import {
    createSale,
    updateSale,
    deleteSale,
    getBusinessSales,
    getSales,
    getAllSales
} from "../controllers/sales.controllers.js";
import { authMiddleware } from "../utils/middlewares/authMiddleware.js";
import { roleMiddleware } from '../utils/middlewares/roleMiddleware.js'

const salesRoute = Router();

salesRoute.use(authMiddleware);
salesRoute.use(roleMiddleware("business_admin", "system_admin"))

salesRoute.post("/", createSale);
salesRoute.get("/", getBusinessSales);
salesRoute.get("/all-sales", getAllSales)
salesRoute.get("/:id", getSales);
salesRoute.put("/:id", updateSale);
salesRoute.delete("/:id", deleteSale);

export default salesRoute;