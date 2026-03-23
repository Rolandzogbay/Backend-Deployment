// controllers/settings.controllers.js
import bcrypt from "bcrypt";
import User from "../models/user.models.js";
import BusinessSettings from "../models/businessSettings.models.js";

export const getOrCreateBusinessSettings = async (businessId) => {
    let settings = await BusinessSettings.findOne({ where: { businessId } });

    if (!settings) {
        settings = await BusinessSettings.create({ businessId });
    }

    return settings;
};

const setIfDefined = (target, key, value) => {
    if (value !== undefined) {
        target[key] = value;
    }
};

export const getSettings = async (req, res) => {
    try {
        const settings = await getOrCreateBusinessSettings(req.user.businessId);

        return res.status(200).json({
            security: {
                email_login_alerts: settings.email_login_alerts,
                two_factor_enabled: settings.two_factor_enabled,
                force_logout_on_password_change: settings.force_logout_on_password_change,
            },
            notifications: {
                low_stock_email: settings.low_stock_email,
                sales_email: settings.sales_email,
                purchase_order_email: settings.purchase_order_email,
                daily_summary_email: settings.daily_summary_email,
                low_stock_in_app: settings.low_stock_in_app,
                sales_in_app: settings.sales_in_app,
                purchase_order_in_app: settings.purchase_order_in_app,
                notification_sound: settings.notification_sound,
            },
            appearance: {
                theme_mode: settings.theme_mode,
                default_landing_page: settings.default_landing_page,
                dashboard_default_range: settings.dashboard_default_range,
                timezone: settings.timezone,
                date_format: settings.date_format,
                time_format: settings.time_format,
                language: settings.language,
            },
            operations: {
                currency: settings.currency,
                tax_rate: Number(settings.tax_rate || 0),
                low_stock_default_threshold: settings.low_stock_default_threshold,
                default_payment_method: settings.default_payment_method,
                track_inventory_on_sale: settings.track_inventory_on_sale,
                allow_negative_stock: settings.allow_negative_stock,
                auto_generate_sku: settings.auto_generate_sku,
                require_payment_method_on_sale: settings.require_payment_method_on_sale,
                require_customer_name_on_sale: settings.require_customer_name_on_sale,
                enable_barcode_scanning: settings.enable_barcode_scanning,
            },
            receipts: {
                show_logo: settings.receipt_show_logo,
                show_phone: settings.receipt_show_phone,
                show_email: settings.receipt_show_email,
                show_address: settings.receipt_show_address,
                show_cashier_name: settings.receipt_show_cashier_name,
                header_text: settings.receipt_header_text,
                footer_note: settings.receipt_footer_note,
                paper_size: settings.receipt_paper_size,
            },
            team: {
                allow_staff_view_reports: settings.allow_staff_view_reports,
                allow_staff_edit_products: settings.allow_staff_edit_products,
                allow_staff_create_purchase_orders: settings.allow_staff_create_purchase_orders,
                enable_audit_logs: settings.enable_audit_logs,
                require_purchase_order_approval: settings.require_purchase_order_approval,
                default_new_staff_role: settings.default_new_staff_role,
            },
            data: {
                auto_backup_enabled: settings.auto_backup_enabled,
                backup_frequency: settings.backup_frequency,
                allow_csv_product_import: settings.allow_csv_product_import,
                allow_sales_export: settings.allow_sales_export,
            },
            integrations: {
                whatsapp_enabled: settings.whatsapp_enabled,
                whatsapp_number: settings.whatsapp_number,
                printer_enabled: settings.printer_enabled,
                payment_gateway_enabled: settings.payment_gateway_enabled,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch settings",
            error: error.message,
        });
    }
};

export const updateSecuritySettings = async (req, res) => {
    try {
        const {
            current_password,
            new_password,
            email_login_alerts,
            two_factor_enabled,
            force_logout_on_password_change,
        } = req.body;

        const settings = await getOrCreateBusinessSettings(req.user.businessId);
        const user = await User.findByPk(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (new_password) {
            if (!current_password) {
                return res.status(400).json({ message: "Current password is required" });
            }

            const isMatch = await bcrypt.compare(current_password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }

            user.password = await bcrypt.hash(new_password, 10);
            await user.save();
        }

        setIfDefined(settings, "email_login_alerts", email_login_alerts);
        setIfDefined(settings, "two_factor_enabled", two_factor_enabled);
        setIfDefined(settings, "force_logout_on_password_change", force_logout_on_password_change);

        await settings.save();

        return res.status(200).json({
            message: "Security settings updated successfully",
            security: {
                email_login_alerts: settings.email_login_alerts,
                two_factor_enabled: settings.two_factor_enabled,
                force_logout_on_password_change: settings.force_logout_on_password_change,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update security settings",
            error: error.message,
        });
    }
};

export const updateNotificationSettings = async (req, res) => {
    try {
        const settings = await getOrCreateBusinessSettings(req.user.businessId);

        setIfDefined(settings, "low_stock_email", req.body.low_stock_email);
        setIfDefined(settings, "sales_email", req.body.sales_email);
        setIfDefined(settings, "purchase_order_email", req.body.purchase_order_email);
        setIfDefined(settings, "daily_summary_email", req.body.daily_summary_email);
        setIfDefined(settings, "low_stock_in_app", req.body.low_stock_in_app);
        setIfDefined(settings, "sales_in_app", req.body.sales_in_app);
        setIfDefined(settings, "purchase_order_in_app", req.body.purchase_order_in_app);
        setIfDefined(settings, "notification_sound", req.body.notification_sound);

        await settings.save();

        return res.status(200).json({
            message: "Notification settings updated successfully",
            notifications: {
                low_stock_email: settings.low_stock_email,
                sales_email: settings.sales_email,
                purchase_order_email: settings.purchase_order_email,
                daily_summary_email: settings.daily_summary_email,
                low_stock_in_app: settings.low_stock_in_app,
                sales_in_app: settings.sales_in_app,
                purchase_order_in_app: settings.purchase_order_in_app,
                notification_sound: settings.notification_sound,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update notification settings",
            error: error.message,
        });
    }
};

export const updateAppearanceSettings = async (req, res) => {
    try {
        const settings = await getOrCreateBusinessSettings(req.user.businessId);

        setIfDefined(settings, "theme_mode", req.body.theme_mode);
        setIfDefined(settings, "default_landing_page", req.body.default_landing_page);
        setIfDefined(settings, "dashboard_default_range", req.body.dashboard_default_range);
        setIfDefined(settings, "timezone", req.body.timezone);
        setIfDefined(settings, "date_format", req.body.date_format);
        setIfDefined(settings, "time_format", req.body.time_format);
        setIfDefined(settings, "language", req.body.language);

        await settings.save();

        return res.status(200).json({
            message: "Appearance settings updated successfully",
            appearance: {
                theme_mode: settings.theme_mode,
                default_landing_page: settings.default_landing_page,
                dashboard_default_range: settings.dashboard_default_range,
                timezone: settings.timezone,
                date_format: settings.date_format,
                time_format: settings.time_format,
                language: settings.language,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update appearance settings",
            error: error.message,
        });
    }
};

export const updateOperationsSettings = async (req, res) => {
    try {
        const settings = await getOrCreateBusinessSettings(req.user.businessId);

        setIfDefined(settings, "currency", req.body.currency);
        setIfDefined(settings, "tax_rate", req.body.tax_rate);
        setIfDefined(settings, "low_stock_default_threshold", req.body.low_stock_default_threshold);
        setIfDefined(settings, "default_payment_method", req.body.default_payment_method);
        setIfDefined(settings, "track_inventory_on_sale", req.body.track_inventory_on_sale);
        setIfDefined(settings, "allow_negative_stock", req.body.allow_negative_stock);
        setIfDefined(settings, "auto_generate_sku", req.body.auto_generate_sku);
        setIfDefined(settings, "require_payment_method_on_sale", req.body.require_payment_method_on_sale);
        setIfDefined(settings, "require_customer_name_on_sale", req.body.require_customer_name_on_sale);
        setIfDefined(settings, "enable_barcode_scanning", req.body.enable_barcode_scanning);

        await settings.save();

        return res.status(200).json({
            message: "Operations settings updated successfully",
            operations: {
                currency: settings.currency,
                tax_rate: Number(settings.tax_rate || 0),
                low_stock_default_threshold: settings.low_stock_default_threshold,
                default_payment_method: settings.default_payment_method,
                track_inventory_on_sale: settings.track_inventory_on_sale,
                allow_negative_stock: settings.allow_negative_stock,
                auto_generate_sku: settings.auto_generate_sku,
                require_payment_method_on_sale: settings.require_payment_method_on_sale,
                require_customer_name_on_sale: settings.require_customer_name_on_sale,
                enable_barcode_scanning: settings.enable_barcode_scanning,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update operations settings",
            error: error.message,
        });
    }
};

export const updateReceiptSettings = async (req, res) => {
    try {
        const settings = await getOrCreateBusinessSettings(req.user.businessId);

        setIfDefined(settings, "receipt_show_logo", req.body.show_logo);
        setIfDefined(settings, "receipt_show_phone", req.body.show_phone);
        setIfDefined(settings, "receipt_show_email", req.body.show_email);
        setIfDefined(settings, "receipt_show_address", req.body.show_address);
        setIfDefined(settings, "receipt_show_cashier_name", req.body.show_cashier_name);
        setIfDefined(settings, "receipt_header_text", req.body.header_text);
        setIfDefined(settings, "receipt_footer_note", req.body.footer_note);
        setIfDefined(settings, "receipt_paper_size", req.body.paper_size);

        await settings.save();

        return res.status(200).json({
            message: "Receipt settings updated successfully",
            receipts: {
                show_logo: settings.receipt_show_logo,
                show_phone: settings.receipt_show_phone,
                show_email: settings.receipt_show_email,
                show_address: settings.receipt_show_address,
                show_cashier_name: settings.receipt_show_cashier_name,
                header_text: settings.receipt_header_text,
                footer_note: settings.receipt_footer_note,
                paper_size: settings.receipt_paper_size,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update receipt settings",
            error: error.message,
        });
    }
};

export const updateTeamSettings = async (req, res) => {
    try {
        const settings = await getOrCreateBusinessSettings(req.user.businessId);

        setIfDefined(settings, "allow_staff_view_reports", req.body.allow_staff_view_reports);
        setIfDefined(settings, "allow_staff_edit_products", req.body.allow_staff_edit_products);
        setIfDefined(settings, "allow_staff_create_purchase_orders", req.body.allow_staff_create_purchase_orders);
        setIfDefined(settings, "enable_audit_logs", req.body.enable_audit_logs);
        setIfDefined(settings, "require_purchase_order_approval", req.body.require_purchase_order_approval);
        setIfDefined(settings, "default_new_staff_role", req.body.default_new_staff_role);

        await settings.save();

        return res.status(200).json({
            message: "Team settings updated successfully",
            team: {
                allow_staff_view_reports: settings.allow_staff_view_reports,
                allow_staff_edit_products: settings.allow_staff_edit_products,
                allow_staff_create_purchase_orders: settings.allow_staff_create_purchase_orders,
                enable_audit_logs: settings.enable_audit_logs,
                require_purchase_order_approval: settings.require_purchase_order_approval,
                default_new_staff_role: settings.default_new_staff_role,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update team settings",
            error: error.message,
        });
    }
};

export const updateDataSettings = async (req, res) => {
    try {
        const settings = await getOrCreateBusinessSettings(req.user.businessId);

        setIfDefined(settings, "auto_backup_enabled", req.body.auto_backup_enabled);
        setIfDefined(settings, "backup_frequency", req.body.backup_frequency);
        setIfDefined(settings, "allow_csv_product_import", req.body.allow_csv_product_import);
        setIfDefined(settings, "allow_sales_export", req.body.allow_sales_export);

        await settings.save();

        return res.status(200).json({
            message: "Data settings updated successfully",
            data: {
                auto_backup_enabled: settings.auto_backup_enabled,
                backup_frequency: settings.backup_frequency,
                allow_csv_product_import: settings.allow_csv_product_import,
                allow_sales_export: settings.allow_sales_export,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update data settings",
            error: error.message,
        });
    }
};

export const updateIntegrationsSettings = async (req, res) => {
    try {
        const settings = await getOrCreateBusinessSettings(req.user.businessId);

        setIfDefined(settings, "whatsapp_enabled", req.body.whatsapp_enabled);
        setIfDefined(settings, "whatsapp_number", req.body.whatsapp_number);
        setIfDefined(settings, "printer_enabled", req.body.printer_enabled);
        setIfDefined(settings, "payment_gateway_enabled", req.body.payment_gateway_enabled);

        await settings.save();

        return res.status(200).json({
            message: "Integration settings updated successfully",
            integrations: {
                whatsapp_enabled: settings.whatsapp_enabled,
                whatsapp_number: settings.whatsapp_number,
                printer_enabled: settings.printer_enabled,
                payment_gateway_enabled: settings.payment_gateway_enabled,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update integration settings",
            error: error.message,
        });
    }
};