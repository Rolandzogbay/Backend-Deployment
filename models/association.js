import Sale from "./sales.model.js"
import SaleItem from "./salesItems.models.js"
import Product from "./products.models.js"
import Notification from "./notification.model.js"
import PurchaseOrder from "./purchaseOrder.model.js"
import PurchaseOrderItem from "./purchaseOrderItem.model.js"
import Business from "./business.models.js"
import user from "./user.models.js"
import Customer from "./customers.models.js"
import BusinessSettings from "./businessSettings.models.js"

Sale.hasMany(SaleItem, {
    foreignKey: 'saleId',
    as: 'items'
})

SaleItem.belongsTo(Sale, {
    foreignKey: 'saleId'
})

SaleItem.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
})

Product.hasMany(SaleItem, {
    foreignKey: 'productId'
})
Product.hasMany(Notification, {
    foreignKey: 'productId',
    as: 'notifications'
});
Notification.belongsTo(Product, {
    foreignKey: "productId",
    as: 'product'
})

PurchaseOrder.hasMany(PurchaseOrderItem, {
    foreignKey: "purchaseOrderId",
    as: "items"
})
PurchaseOrderItem.belongsTo(PurchaseOrder, {
    foreignKey: "purchaseOrderId"
})
PurchaseOrderItem.belongsTo(Product, {
    foreignKey: "productId",
    as: "product"
})
Product.hasMany(PurchaseOrderItem, {
    foreignKey: "productId"
});

/**
 * Business ↔ Users
 */
Business.hasMany(user, {
    foreignKey: "businessId",
    as: "users"
});

user.belongsTo(Business, {
    foreignKey: "businessId",
    as: "business"
});

/**
 * Business ↔ Products
 */
Business.hasMany(Product, {
    foreignKey: "businessId",
    as: "products"
});

Product.belongsTo(Business, {
    foreignKey: "businessId",
    as: "business"
});

/**
 * Business ↔ Customers
 */
Business.hasMany(Customer, {
    foreignKey: "businessId",
    as: "customers"
});

Customer.belongsTo(Business, {
    foreignKey: "businessId",
    as: "business"
});

/**
 * Business ↔ Sales
 */
Business.hasMany(Sale, {
    foreignKey: "businessId",
    as: "sales"
});

Business.hasOne(BusinessSettings, { foreignKey: "businessId", as: "settings" });
BusinessSettings.belongsTo(Business, { foreignKey: "businessId", as: "business" });

Sale.belongsTo(Business, {
    foreignKey: "businessId",
    as: "business"
});

/**
 * User ↔ Sales
 */
user.hasMany(Sale, {
    foreignKey: "userId",
    as: "sales"
});

Sale.belongsTo(user, {
    foreignKey: "userId",
    as: "user"
});

/**
 * Business ↔ Notifications
 */
Business.hasMany(Notification, {
    foreignKey: "businessId",
    as: "notifications"
});

Notification.belongsTo(Business, {
    foreignKey: "businessId",
    as: "business"
});

Business.hasMany(PurchaseOrder, {
    foreignKey: "businessId",
    as: "purchaseOrders"
});

PurchaseOrder.belongsTo(Business, {
    foreignKey: "businessId",
    as: "business"
});

user.hasMany(PurchaseOrder, {
    foreignKey: "userId",
    as: "purchaseOrders"
});

PurchaseOrder.belongsTo(user, {
    foreignKey: "userId",
    as: "user"
});