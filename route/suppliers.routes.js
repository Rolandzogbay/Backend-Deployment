import { Router } from "express";
import {
    createSupplier,
    getSuppliersByBusiness,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
} from "../controllers/suppliers.controllers.js";
import { authMiddleware } from "../utils/middlewares/authMiddleware.js";
import { roleMiddleware } from "../utils/middlewares/roleMiddleware.js";

const supplierRoute = Router();

supplierRoute.use(authMiddleware);
supplierRoute.use(roleMiddleware("business_admin", "system_admin"));

supplierRoute.post("/", createSupplier);
supplierRoute.get("/", getSuppliersByBusiness);
supplierRoute.get("/:id", getSupplierById);
supplierRoute.put("/:id", updateSupplier);
supplierRoute.delete("/:id", deleteSupplier);

export default supplierRoute;