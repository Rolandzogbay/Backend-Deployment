import bcrypt from "bcrypt";
import Business from "../models/business.models.js";
import User from "../models/user.models.js";

export async function createSuperAdmin() {
    try {
        const email = process.env.SUPER_ADMIN_EMAIL;
        const password = process.env.SUPER_ADMIN_PASSWORD;

        if (!email || !password) {
            console.error("Missing SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD in .env");
            return;
        }

        const [systemBiz] = await Business.findOrCreate({
            where: { name: "SYSTEM" },
            defaults: {
                name: "SYSTEM",
                owner_name: "Platform",
                taxIdentificationNumber: "000000",
                email: null,
                phone: null,
                address: null,
                theme_color: "#f97316",
                logo_url: null,
            },
        });

        const existing = await User.findOne({ where: { email } });

        if (existing) {
            let updated = false;

            if (existing.role !== "system_admin") {
                existing.role = "system_admin";
                updated = true;
            }

            if (existing.businessId !== systemBiz.id) {
                existing.businessId = systemBiz.id;
                updated = true;
            }

            if (!existing.email_verified) {
                existing.email_verified = true;
                updated = true;
            }

            if (updated) {
                await existing.save();
                console.log("System admin already existed and was updated:", email);
            } else {
                console.log("System admin already exists:", email);
            }

            return;
        }

        const hashed = await bcrypt.hash(password, 12);

        await User.create({
            name: "System Admin",
            email,
            password: hashed,
            role: "system_admin",
            businessId: systemBiz.id,
            email_verified: true,
            phone: null,
            avatar_url: null,
            email_verification_token: null,
            email_verify_expires: null,
        });

        console.log("✅ System admin created:", email);
    } catch (error) {
        console.error("Failed to create system admin:", error);
    }
}