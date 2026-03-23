import { Router } from "express";
import {
    addSystemAdmin,
    deleteUser,
    getAllUsers,
    getUserBusiness,
    getUserById,
    getUsersPaginated,
    searchUsers,
    updateUser,
} from "../controllers/users.controllers.js";

import { authMiddleware } from "../utils/middlewares/authMiddleware.js";
import { roleMiddleware } from "../utils/middlewares/roleMiddleware.js";


const userRoute = Router();
userRoute.use(authMiddleware);
userRoute.use(roleMiddleware("business_admin", "system_admin"))
userRoute.get("/", getAllUsers);
userRoute.get("/search", searchUsers);
userRoute.get("/paginated", getUsersPaginated);
userRoute.get("/:id", getUserById);
userRoute.get("/:id/business", getUserBusiness);
userRoute.put("/:id", updateUser);
userRoute.delete("/:id", deleteUser);
userRoute.patch("/promote/system-admin", addSystemAdmin);

export default userRoute;