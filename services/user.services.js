import bcrypt from "bcrypt";
import { Op } from "sequelize";
import Business from "../models/business.models.js";
import User from "../models/user.models.js";

class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const getAllUsersService = async () => {
    return await User.findAll({
        include: [
            {
                model: Business,
                as: "business",
                attributes: ["id", "name"],
            },
        ],
        attributes: { exclude: ["hashed_password"] },
        order: [["createdAt", "DESC"]],
    });
};

export const getUserByIdService = async (id) => {
    const user = await User.findByPk(id, {
        include: [
            {
                model: Business,
                as: "business",
                attributes: ["id", "name"],
            },
        ],
        attributes: { exclude: ["hashed_password"] },
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return user;
};

export const getUsersPaginatedService = async (page = 1, limit = 10) => {
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const offset = (parsedPage - 1) * parsedLimit;

    const result = await User.findAndCountAll({
        include: [
            {
                model: Business,
                as: "business",
                attributes: ["id", "name"],
            },
        ],
        attributes: { exclude: ["hashed_password"] },
        limit: parsedLimit,
        offset,
        order: [["createdAt", "DESC"]],
    });

    return {
        users: result.rows,
        total: result.count,
        page: parsedPage,
        limit: parsedLimit,
    };
};

export const searchUsersService = async (query) => {
    if (!query) {
        throw new AppError("Query parameter is required", 400);
    }

    return await User.findAll({
        where: {
            [Op.or]: [
                { name: { [Op.iLike]: `%${query}%` } },
                { email: { [Op.iLike]: `%${query}%` } },
                { role: { [Op.iLike]: `%${query}%` } },
            ],
        },
        include: [
            {
                model: Business,
                as: "business",
                attributes: ["id", "name"],
            },
        ],
        attributes: { exclude: ["hashed_password"] },
        order: [["createdAt", "DESC"]],
    });
};

export const updateUserService = async (id, payload) => {
    const user = await User.findByPk(id);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const { name, email, password, role, businessId } = payload;

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    if (businessId !== undefined) {
        user.businessId = businessId;
    }

    if (password) {
        user.hashed_password = await bcrypt.hash(password, 12);
    }

    await user.save();

    return await User.findByPk(user.id, {
        include: [
            {
                model: Business,
                as: "business",
                attributes: ["id", "name"],
            },
        ],
        attributes: { exclude: ["hashed_password"] },
    });
};

export const deleteUserService = async (id) => {
    const user = await User.findByPk(id);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    await user.destroy();

    return {
        message: "User deleted successfully",
    };
};

export const getUserBusinessService = async (id) => {
    const user = await User.findByPk(id, {
        include: [
            {
                model: Business,
                as: "business",
                attributes: ["id", "name", "owner_name", "email"],
            },
        ],
        attributes: { exclude: ["hashed_password"] },
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return user.business;
};

export const addSystemAdminService = async (userId) => {
    const user = await User.findByPk(userId);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    user.role = "system_admin";
    await user.save();

    return {
        message: "User promoted to system admin successfully",
        user,
    };
};