// controllers/auth.controllers.js
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import Business from "../models/business.models.js";
import BusinessSettings from "../models/businessSettings.models.js";
import User from "../models/user.models.js";
import { generateTokenPair } from "../utils/helpers/resetToken.js";

const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "24h";
const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || "7d";

const REFRESH_COOKIE_MAX_AGE =
    Number(process.env.REFRESH_COOKIE_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000;

function signAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES,
    });
}

function signRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES,
    });
}

function setRefreshCookie(res, refreshToken) {
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/api/auth/refresh",
        maxAge: REFRESH_COOKIE_MAX_AGE,
    });
}

function clearRefreshCookie(res) {
    const isProd = process.env.NODE_ENV === "production";

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/api/auth/refresh",
    });
}

function safeUserResponse(user, business = null) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url || "",
        email_verified: user.email_verified,
        role: user.role,
        business: business
            ? {
                id: business.id,
                name: business.name,
                owner_name: business.owner_name,
                email: business.email,
                phone: business.phone,
                address: business.address,
                logo_url: business.logo_url,
                theme_color: business.theme_color,
                type: business.type,
                is_personal: business.is_personal,
            }
            : null,
    };
}

export const registerUser = async (req, res) => {
    const transaction = await Business.sequelize.transaction();

    try {
        const {
            name,
            owner_name,
            email,
            password,
            taxIdentificationNumber,
            phone,
            business_email,
            business_phone,
            address,
            theme_color,
            useType,
            business_name,
        } = req.body;

        const registrationMode = useType === "personal" ? "personal" : "business";

        if (!email || !password) {
            await transaction.rollback();
            return res.status(400).json({ message: "Email and password are required" });
        }

        if (registrationMode === "business") {
            if (!name || !owner_name) {
                await transaction.rollback();
                return res.status(400).json({
                    message: "Business registration requires name and owner_name",
                });
            }
        }

        if (registrationMode === "personal") {
            if (!name) {
                await transaction.rollback();
                return res.status(400).json({
                    message: "Name is required for personal registration",
                });
            }
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            await transaction.rollback();
            return res.status(400).json({ message: "Invalid email format" });
        }

        if (password.length < 8) {
            await transaction.rollback();
            return res.status(400).json({
                message: "Password must be at least 8 characters",
            });
        }

        if (theme_color && !/^#([A-Fa-f0-9]{6})$/.test(theme_color)) {
            await transaction.rollback();
            return res.status(400).json({ message: "Invalid theme color format" });
        }

        const existingUser = await User.findOne({ where: { email }, transaction });
        if (existingUser) {
            await transaction.rollback();
            return res.status(400).json({ message: "Email already in use" });
        }

        const avatarFile = req.files?.avatar?.[0];
        const businessLogoFile = req.files?.businessLogo?.[0];

        let businessPayload = null;
        let ownerNameToUse = owner_name || name;

        if (registrationMode === "personal") {
            const personalBusinessName =
                business_name?.trim() || `${name}'s Inventory`;

            const existingBiz = await Business.findOne({
                where: { name: personalBusinessName },
                transaction,
            });

            if (existingBiz) {
                await transaction.rollback();
                return res.status(400).json({
                    message: "A personal workspace with this name already exists",
                });
            }

            businessPayload = {
                name: personalBusinessName,
                owner_name: name,
                email: business_email || null,
                phone: business_phone || phone || null,
                address: address || null,
                theme_color: theme_color || "#f97316",
                logo_url: businessLogoFile
                    ? `/${businessLogoFile.path.replace(/\\/g, "/")}`
                    : null,
                type: "personal",
                is_personal: true,
            };
        } else {
            const existingBiz = await Business.findOne({
                where: { name },
                transaction,
            });

            if (existingBiz) {
                await transaction.rollback();
                return res.status(400).json({ message: "Business already exists" });
            }

            businessPayload = {
                name,
                owner_name,
                taxIdentificationNumber,
                email: business_email || null,
                phone: business_phone || null,
                address: address || null,
                theme_color: theme_color || "#f97316",
                logo_url: businessLogoFile
                    ? `/${businessLogoFile.path.replace(/\\/g, "/")}`
                    : null,
                type: "registered",
                is_personal: false,
            };
        }

        const business = await Business.create(businessPayload, { transaction });

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create(
            {
                name: ownerNameToUse,
                email,
                phone: phone || null,
                password: hashedPassword,
                avatar_url: avatarFile
                    ? `/${avatarFile.path.replace(/\\/g, "/")}`
                    : null,
                role: "business_admin",
                businessId: business.id,
                email_verified: true,
                email_verification_token: null,
                email_verify_expires: null,
            },
            { transaction }
        );

        await BusinessSettings.create(
            {
                businessId: business.id,
            },
            { transaction }
        );

        await transaction.commit();

        return res.status(201).json({
            message:
                registrationMode === "personal"
                    ? "Personal workspace and user registered successfully."
                    : "Business and user registered successfully.",
            user: safeUserResponse(user, business),
            requiresEmailVerification: false,
        });
    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const verifyEmailRedirect = async (req, res) => {
    return res.redirect(`${process.env.APP_URL}/login?verified=1`);
};

export const resendVerificationEmail = async (req, res) => {
    return res.status(200).json({
        message: "Email verification is temporarily disabled.",
    });
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email & Password fields are required" });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const business = await Business.findByPk(user.businessId);

        const jwtPayload = {
            userId: user.id,
            businessId: user.businessId,
            role: user.role,
        };

        const accessToken = signAccessToken(jwtPayload);
        const refreshToken = signRefreshToken(jwtPayload);

        setRefreshCookie(res, refreshToken);

        return res.status(200).json({
            message: "Login successful",
            token: accessToken,
            user: safeUserResponse(user, business),
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const tokenFromCookie = req.cookies?.refreshToken;
        if (!tokenFromCookie) {
            return res.status(401).json({ message: "Missing refresh token" });
        }

        let payload;
        try {
            payload = jwt.verify(tokenFromCookie, process.env.JWT_REFRESH_SECRET);
        } catch {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        const user = await User.findByPk(payload.userId);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const business = await Business.findByPk(user.businessId);

        const newPayload = {
            userId: user.id,
            businessId: user.businessId,
            role: user.role,
        };

        const newAccessToken = signAccessToken(newPayload);
        const newRefreshToken = signRefreshToken(newPayload);

        setRefreshCookie(res, newRefreshToken);

        return res.status(200).json({
            message: "Token refreshed",
            token: newAccessToken,
            user: safeUserResponse(user, business),
        });
    } catch (error) {
        console.error("Refresh error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const logoutUser = async (req, res) => {
    try {
        clearRefreshCookie(res);
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ where: { email } });

        const genericMsg = "Enter the email used during registration. Invlid email address";

        if (!user) {
            return res.status(200).json({ message: genericMsg });
        }

        const { rawToken, hashedToken } = generateTokenPair();

        user.reset_password_token = hashedToken;
        user.reset_password_expires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        return res.status(200).json({
            message: genericMsg,
            resetToken: rawToken,
            email,
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;

        if (!email || !token || !newPassword) {
            return res.status(400).json({
                message: "Email, token and newPassword are required",
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters",
            });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            where: {
                email,
                reset_password_token: hashedToken,
            },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        if (!user.reset_password_expires || user.reset_password_expires < new Date()) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;

        user.reset_password_token = null;
        user.reset_password_expires = null;
        await user.save();

        return res.status(200).json({
            message: "Password reset successful. You can now log in.",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};