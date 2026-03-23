import User from "../models/user.models.js";
import Business from "../models/business.models.js";

export const getMyProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId, {
            attributes: { exclude: ["password"] },
            include: [
                {
                    model: Business,
                    as: "business",
                },
            ],
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch profile",
            error: error.message,
        });
    }
};

export const updateMyProfile = async (req, res) => {
    try {
        const { name, email, phone, remove_avatar } = req.body;

        const user = await User.findByPk(req.user.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (email && email !== user.email) {
            const exists = await User.findOne({ where: { email } });
            if (exists) return res.status(409).json({ message: "Email already in use" });
        }

        user.name = name ?? user.name;
        user.email = email ?? user.email;
        user.phone = phone ?? user.phone;

        if (req.file) {
            user.avatar_url = `/${req.file.path.replace(/\\/g, "/")}`;
        }

        if (remove_avatar === "true") {
            user.avatar_url = null;
        }

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            user,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update user profile",
            error: error.message,
        });
    }
};

export const updateBusinessProfile = async (req, res) => {
    try {
        const { name, owner_name, email, phone, address, theme_color, remove_logo } = req.body;

        const business = await Business.findByPk(req.user.businessId);
        if (!business) return res.status(404).json({ message: "Business not found" });

        business.name = name ?? business.name;
        business.owner_name = owner_name ?? business.owner_name;
        business.email = email ?? business.email;
        business.phone = phone ?? business.phone;
        business.address = address ?? business.address;
        business.theme_color = theme_color ?? business.theme_color;

        if (req.file) {
            business.logo_url = `/${req.file.path.replace(/\\/g, "/")}`;
        }

        if (remove_logo === "true") {
            business.logo_url = null;
        }

        await business.save();

        return res.status(200).json({
            message: "Business profile updated successfully",
            business,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update business profile",
            error: error.message,
        });
    }
};