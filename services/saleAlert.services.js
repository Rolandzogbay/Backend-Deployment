import { createNotificationService } from "./notifications.services.js";


export const handleProductStockAlert = async (product) => {
    const qty = Number(product.stock_quantity || 0);
    const threshold = Number(product.low_stock_threshold || 10);

    if (qty === 0) {
        await createNotificationService({
            title: "Out of stock",
            message: `${product.name} is now out of stock.`,
            type: "out_of_stock",
            businessId: product.businessId,
            productId: product.id
        });
        return;
    }

    if (qty <= threshold) {
        await createNotificationService({
            title: "Low stock alert",
            message: `${product.name} is low in stock. Remaining quantity: ${qty}.`,
            type: "low_stock",
            businessId: product.businessId,
            productId: product.id
        });
    }
};