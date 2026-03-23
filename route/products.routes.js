// routes/products.routes.js
import { Router } from "express";
import {
    createProduct,
    getProductsByBusiness,
    getProductById,
    updateProduct,
    getAllProducts,
    archiveProduct,
    restoreProduct,
    permanentlyDeleteProduct,
} from "../controllers/products.controllers.js";
import { authMiddleware } from "../utils/middlewares/authMiddleware.js";
import { roleMiddleware } from "../utils/middlewares/roleMiddleware.js";

const productRoute = Router();

productRoute.use(authMiddleware);
productRoute.use(roleMiddleware("business_admin", "system_admin"));

productRoute.post("/", createProduct);
productRoute.get("/", getProductsByBusiness);
productRoute.get("/all-products", getAllProducts);
productRoute.get("/:id", getProductById);
productRoute.put("/:id", updateProduct);

// safer lifecycle routes
productRoute.patch("/:id/archive", archiveProduct);
productRoute.patch("/:id/restore", restoreProduct);
productRoute.delete("/:id/permanent", permanentlyDeleteProduct);

export default productRoute;