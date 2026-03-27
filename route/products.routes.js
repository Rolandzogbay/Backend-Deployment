// routes/products.routes.js
import { Router } from "express";
import { authMiddleware } from "../utils/middlewares/authMiddleware.js";
import { roleMiddleware } from "../utils/middlewares/roleMiddleware.js";
import importUpload from "../utils/helpers/uploadImportFile.js";
import {
    createProduct,
    createBulkProducts,
    previewImportProducts,
    confirmImportProducts,
    getAllProducts,
    getProductsByBusiness,
    getProductById,
    findProductByBarcode,
    updateProduct,
    archiveProduct,
    restoreProduct,
    permanentlyDeleteProduct,
    addProductBatch,
    getExpiredProducts,
    getExpiringSoonProducts,
} from "../controllers/products.controllers.js";

const productRoute = Router();

productRoute.use(authMiddleware);
productRoute.use(roleMiddleware("business_admin", "system_admin"));

productRoute.get("/", getProductsByBusiness);
productRoute.get("/all", getAllProducts);
productRoute.get("/barcode/:barcode", findProductByBarcode);
productRoute.get("/expired", getExpiredProducts);
productRoute.get("/expiring-soon", getExpiringSoonProducts);
productRoute.get("/:id", getProductById);

productRoute.post("/", createProduct);
productRoute.post("/bulk-create", createBulkProducts);
productRoute.post("/import/preview", importUpload.single("file"), previewImportProducts);
productRoute.post("/import/confirm", importUpload.single("file"), confirmImportProducts);
productRoute.post("/:id/batches", addProductBatch);

productRoute.patch("/:id", updateProduct);
productRoute.patch("/:id/archive", archiveProduct);
productRoute.patch("/:id/restore", restoreProduct);
productRoute.delete("/:id/permanent", permanentlyDeleteProduct);

export default productRoute;