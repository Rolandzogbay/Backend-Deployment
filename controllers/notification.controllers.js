import {
    getNotificationsByBusinessService,
    markNotificationAsReadService,
    markAllNotificationsAsReadService,
    deleteAllNotificationsService
} from "../services/notifications.services.js";

export const getNotifications = async (req, res) => {
    try {
        const notifications = await getNotificationsByBusinessService(req.user.businessId);
        return res.status(200).json(notifications);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error"
        });
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        const notification = await markNotificationAsReadService(
            req.params.id,
            req.user.businessId
        );

        return res.status(200).json({
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error"
        });
    }
};

export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const result = await markAllNotificationsAsReadService(req.user.businessId);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error"
        });
    }
};

export const clearNotifications = async (req, res) => {
    try {
        const result = await deleteAllNotificationsService(req.user.businessId);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error"
        });
    }
};