// models/businessSettings.models.js
import db from "../config/connect.js";
import { DataTypes } from "sequelize";

const BusinessSettings = db.define(
    "BusinessSettings",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        businessId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: "Business",
                key: "id",
            },
            onDelete: "CASCADE",
        },

        // security
        email_login_alerts: { type: DataTypes.BOOLEAN, defaultValue: true },
        two_factor_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
        force_logout_on_password_change: { type: DataTypes.BOOLEAN, defaultValue: true },

        // notifications
        low_stock_email: { type: DataTypes.BOOLEAN, defaultValue: true },
        sales_email: { type: DataTypes.BOOLEAN, defaultValue: false },
        purchase_order_email: { type: DataTypes.BOOLEAN, defaultValue: true },
        daily_summary_email: { type: DataTypes.BOOLEAN, defaultValue: false },
        low_stock_in_app: { type: DataTypes.BOOLEAN, defaultValue: true },
        sales_in_app: { type: DataTypes.BOOLEAN, defaultValue: true },
        purchase_order_in_app: { type: DataTypes.BOOLEAN, defaultValue: true },
        notification_sound: { type: DataTypes.BOOLEAN, defaultValue: false },

        // appearance
        theme_mode: { type: DataTypes.STRING, defaultValue: "light" },
        default_landing_page: { type: DataTypes.STRING, defaultValue: "dashboard" },
        dashboard_default_range: { type: DataTypes.STRING, defaultValue: "6m" },
        timezone: { type: DataTypes.STRING, defaultValue: "Africa/Monrovia" },
        date_format: { type: DataTypes.STRING, defaultValue: "DD/MM/YYYY" },
        time_format: { type: DataTypes.STRING, defaultValue: "12h" },
        language: { type: DataTypes.STRING, defaultValue: "en" },

        // operations
        currency: { type: DataTypes.STRING, defaultValue: "USD" },
        tax_rate: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
        low_stock_default_threshold: { type: DataTypes.INTEGER, defaultValue: 10 },
        default_payment_method: { type: DataTypes.STRING, defaultValue: "cash" },
        track_inventory_on_sale: { type: DataTypes.BOOLEAN, defaultValue: true },
        allow_negative_stock: { type: DataTypes.BOOLEAN, defaultValue: false },
        auto_generate_sku: { type: DataTypes.BOOLEAN, defaultValue: true },
        require_payment_method_on_sale: { type: DataTypes.BOOLEAN, defaultValue: true },
        require_customer_name_on_sale: { type: DataTypes.BOOLEAN, defaultValue: false },
        enable_barcode_scanning: { type: DataTypes.BOOLEAN, defaultValue: false },

        // receipts
        receipt_show_logo: { type: DataTypes.BOOLEAN, defaultValue: true },
        receipt_show_phone: { type: DataTypes.BOOLEAN, defaultValue: true },
        receipt_show_email: { type: DataTypes.BOOLEAN, defaultValue: true },
        receipt_show_address: { type: DataTypes.BOOLEAN, defaultValue: true },
        receipt_show_cashier_name: { type: DataTypes.BOOLEAN, defaultValue: true },
        receipt_header_text: { type: DataTypes.STRING, defaultValue: "" },
        receipt_footer_note: {
            type: DataTypes.TEXT,
            defaultValue: "Thank you for doing business with us.",
        },
        receipt_paper_size: { type: DataTypes.STRING, defaultValue: "80mm" },

        // team
        allow_staff_view_reports: { type: DataTypes.BOOLEAN, defaultValue: false },
        allow_staff_edit_products: { type: DataTypes.BOOLEAN, defaultValue: false },
        allow_staff_create_purchase_orders: { type: DataTypes.BOOLEAN, defaultValue: false },
        enable_audit_logs: { type: DataTypes.BOOLEAN, defaultValue: true },
        require_purchase_order_approval: { type: DataTypes.BOOLEAN, defaultValue: false },
        default_new_staff_role: { type: DataTypes.STRING, defaultValue: "employee" },

        // data
        auto_backup_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
        backup_frequency: { type: DataTypes.STRING, defaultValue: "weekly" },
        allow_csv_product_import: { type: DataTypes.BOOLEAN, defaultValue: true },
        allow_sales_export: { type: DataTypes.BOOLEAN, defaultValue: true },

        // integrations
        whatsapp_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
        whatsapp_number: { type: DataTypes.STRING, allowNull: true },
        printer_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
        payment_gateway_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
        timestamps: true,
        freezeTableName: true
    }
);

export default BusinessSettings;