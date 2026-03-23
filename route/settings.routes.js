// routes/settings.routes.js
import express from "express";
import { authMiddleware } from "../utils/middlewares/authMiddleware.js";
import { roleMiddleware } from "../utils/middlewares/roleMiddleware.js";

import {
    getSettings,
    updateSecuritySettings,
    updateNotificationSettings,
    updateAppearanceSettings,
    updateOperationsSettings,
    updateReceiptSettings,
    updateTeamSettings,
    updateDataSettings,
    updateIntegrationsSettings,
} from "../controllers/settings.controllers.js";

const settingRoute = express.Router();
settingRoute.use(authMiddleware);
settingRoute.use(roleMiddleware("business_admin", "system_admin"))

settingRoute.get("/", getSettings);
settingRoute.put("/security", updateSecuritySettings);
settingRoute.put("/notifications", updateNotificationSettings);
settingRoute.put("/appearance", updateAppearanceSettings);
settingRoute.put("/operations", updateOperationsSettings);
settingRoute.put("/receipts", updateReceiptSettings);
settingRoute.put("/team", updateTeamSettings);
settingRoute.put("/data", updateDataSettings);
settingRoute.put("/integrations", updateIntegrationsSettings);

export default settingRoute;