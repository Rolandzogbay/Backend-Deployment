// scripts/seedSystemAdmin.js
import "dotenv/config";
import bcrypt from "bcrypt";
import Business from "../models/business.models.js";
import User from "../models/user.models.js";

async function seed() {
    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!email || !password) {
        console.error("Missing SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD in .env");
        process.exit(1);
    }

    // 1) Ensure system business exists
    const [systemBiz] = await Business.findOrCreate({
        where: { name: "SYSTEM" },
        defaults: {
            name: "SYSTEM",
            owner_name: "Platform",
            taxIdentificationNumber: "000000", // any placeholder
        },
    });

    // 2) Check if admin exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
        console.log("System admin already exists:", email);
        process.exit(0);
    }

    // 3) Create system admin user
    const hashed = await bcrypt.hash(password, 12);

    await User.create({
        name: "System Admin",
        email,
        password: hashed,
        role: "system_admin",
        businessId: systemBiz.id, // ✅ FIX
    });

    console.log("✅ System admin created:", email);
    process.exit(0);
}

seed().catch((e) => {
    console.error(e);
    process.exit(1);
});