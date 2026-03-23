import Notification from "../models/notification.model.js";

export const createNotificationService = async ({
  title,
  message,
  type = "system",
  businessId,
  productId = null
}) => {
  const existingUnread = await Notification.findOne({
    where: {
      businessId,
      productId,
      type,
      is_read: false
    }
  });

  if (existingUnread) {
    return existingUnread;
  }

  return await Notification.create({
    title,
    message,
    type,
    businessId,
    productId
  });
};

export const getNotificationsByBusinessService = async (businessId) => {
  return await Notification.findAll({
    where: { businessId },
    order: [["createdAt", "DESC"]],
    limit: 20
  });
};

export const markNotificationAsReadService = async (id, businessId) => {
  const notification = await Notification.findOne({
    where: { id, businessId }
  });

  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  notification.is_read = true;
  await notification.save();
  return notification;
};

export const markAllNotificationsAsReadService = async (businessId) => {
  await Notification.update(
    { is_read: true },
    { where: { businessId, is_read: false } }
  );

  return { message: "All notifications marked as read" };
};

export const deleteAllNotificationsService = async (businessId) => {
  await Notification.destroy({
    where: { businessId }
  });

  return { message: "Notifications cleared successfully" };
};