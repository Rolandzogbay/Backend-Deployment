import { Router } from "express";
import {
    createCustomer,
    getCustomersByBusiness,
    getCustomerById,
    updateCustomer,
    deleteCustomer
} from "../controllers/customers.controllers.js";
import { authMiddleware } from "../utils/middlewares/authMiddleware.js";
import { roleMiddleware } from "../utils/middlewares/roleMiddleware.js";

const customerRoute = Router();

customerRoute.use(authMiddleware);
customerRoute.use(roleMiddleware('business_admin', 'system_admin'))

customerRoute.post("/", createCustomer);
customerRoute.get("/", getCustomersByBusiness);
customerRoute.get("/:id", getCustomerById);
customerRoute.put("/:id", updateCustomer);
customerRoute.delete("/:id", deleteCustomer);

export default customerRoute;