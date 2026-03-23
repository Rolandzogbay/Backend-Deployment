import { Router } from "express";
import {
    createBusiness,
    deleteBusiness,
    getAllBusinesses,
    getBusinessById,
    getBusinessUsers,
    getBusinessesPaginated,
    searchBusinesses,
    updateBusiness,
} from "../controllers/business.controllers.js";

import { authMiddleware } from "../utils/middlewares/authMiddleware.js";
import { roleMiddleware } from "../utils/middlewares/roleMiddleware.js";

const businessRoute = Router();
businessRoute.use(authMiddleware);
businessRoute.use(roleMiddleware('business_admin', "system_admin"))

businessRoute.get("/", getAllBusinesses);
businessRoute.get("/search", searchBusinesses);
businessRoute.get("/paginated", getBusinessesPaginated);
businessRoute.get("/:id", getBusinessById);
businessRoute.get("/:id/users", getBusinessUsers);
businessRoute.post("/", createBusiness);
businessRoute.put("/:id", updateBusiness);
businessRoute.delete("/:id", deleteBusiness);

export default businessRoute;