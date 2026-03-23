import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import Business from "../models/business.models.js";
import User from "../models/user.models.js";

class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}

const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "15m";
const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || "7d";

export const signAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES,
    });
};

export const signRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES,
    });
};

export const setRefreshCookie = (res, token) => {
    res.cookie("refreshToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

export const safeUserResponse = (user, business) => {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        business: business
            ? {
                id: business.id,
                name: business.name,
                owner_name: business.owner_name,
                taxIdentificationNumber: business.taxIdentificationNumber,
            }
            : null,
    };
};

export const getAllBusinessesService = async () => {
    return await Business.findAll({
        include: [
            {
                model: User,
                as: "users",
                attributes: { exclude: ["hashed_password"] },
            },
        ],
        order: [["createdAt", "DESC"]],
    });
};

export const getBusinessByIdService = async (id) => {
    const business = await Business.findByPk(id, {
        include: [
            {
                model: User,
                as: "users",
                attributes: { exclude: ["hashed_password"] },
            },
        ],
    });

    if (!business) {
        throw new AppError("Business not found", 404);
    }

    return business;
};

export const createBusinessService = async ({ name, owner_name, taxIdentificationNumber, email, password }) => {
    if (!name || !owner_name || !taxIdentificationNumber || !email || !password) {
        throw new AppError("All fields are required", 400);
    }

    const existingBusiness = await Business.findOne({
        where: {
            [Op.or]: [
                { name },
                { taxIdentificationNumber },
            ],
        },
    });

    if (existingBusiness) {
        throw new AppError("Business with this name or tax ID already exists", 409);
    }

    const existingUser = await User.findOne({
        where: { email },
    });

    if (existingUser) {
        throw new AppError("User with this email already exists", 409);
    }

    const business = await Business.create({
        name,
        owner_name,
        taxIdentificationNumber,
    });

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
        name: owner_name,
        email,
        hashed_password: hashedPassword,
        role: "business_admin",
        businessId: business.id,
    });

    const jwtPayload = {
        userId: user.id,
        businessId: user.businessId,
        role: user.role,
    };

    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken(jwtPayload);

    return {
        business,
        user,
        accessToken,
        refreshToken,
    };
};

export const searchBusinessesService = async (query) => {
    if (!query) {
        throw new AppError("Query parameter is required", 400);
    }

    return await Business.findAll({
        where: {
            [Op.or]: [
                { name: { [Op.iLike]: `%${query}%` } },
                { owner_name: { [Op.iLike]: `%${query}%` } },
                { taxIdentificationNumber: { [Op.iLike]: `%${query}%` } },
            ],
        },
        order: [["createdAt", "DESC"]],
    });
};

export const getBusinessesPaginatedService = async (page = 1, limit = 10) => {
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const offset = (parsedPage - 1) * parsedLimit;

    const result = await Business.findAndCountAll({
        include: [
            {
                model: User,
                as: "users",
                attributes: ["id", "name", "email", "role"],
            },
        ],
        limit: parsedLimit,
        offset,
        order: [["createdAt", "DESC"]],
    });

    return {
        businesses: result.rows,
        total: result.count,
        page: parsedPage,
        limit: parsedLimit,
    };
};

export const updateBusinessService = async (id, payload) => {
    const business = await Business.findByPk(id);

    if (!business) {
        throw new AppError("Business not found", 404);
    }

    const { name, owner_name, taxIdentificationNumber, email, phone, address, logo_url, theme_color } = payload;

    business.name = name || business.name;
    business.owner_name = owner_name || business.owner_name;
    business.taxIdentificationNumber = taxIdentificationNumber || business.taxIdentificationNumber;
    business.email = email || business.email;
    business.phone = phone || business.phone;
    business.address = address || business.address;
    business.logo_url = logo_url || business.logo_url;
    business.theme_color = theme_color || business.theme_color;

    await business.save();
    return business;
};

export const getBusinessUsersService = async (id) => {
    const business = await Business.findByPk(id, {
        include: [
            {
                model: User,
                as: "users",
                attributes: { exclude: ["hashed_password"] },
            },
        ],
    });

    if (!business) {
        throw new AppError("Business not found", 404);
    }

    return business.users;
};

export const deleteBusinessService = async (id) => {
    const business = await Business.findByPk(id);

    if (!business) {
        throw new AppError("Business not found", 404);
    }

    await business.destroy();

    return {
        message: "Business deleted successfully",
    };
};