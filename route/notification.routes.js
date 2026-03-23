import { Router } from "express";
import { authMiddleware } from "../utils/middlewares/authMiddleware.js";
import { roleMiddleware } from "../utils/middlewares/roleMiddleware.js"
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications
} from "../controllers/notification.controllers.js";

const notificationRoute = Router();

notificationRoute.use(authMiddleware);
notificationRoute.use(roleMiddleware('business_admin', 'system_admin'))

notificationRoute.get("/", getNotifications);
notificationRoute.patch("/:id/read", markNotificationAsRead);
notificationRoute.patch("/read-all", markAllNotificationsAsRead);
notificationRoute.delete("/", clearNotifications);

export default notificationRoute;