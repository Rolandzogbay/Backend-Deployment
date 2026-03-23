import {
    addSystemAdminService,
    deleteUserService,
    getAllUsersService,
    getUserBusinessService,
    getUserByIdService,
    getUsersPaginatedService,
    searchUsersService,
    updateUserService,
} from "../services/user.services.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await getAllUsersService();
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await getUserByIdService(req.params.id);
        return res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const getUsersPaginated = async (req, res) => {
    try {
        const result = await getUsersPaginatedService(req.query.page, req.query.limit);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching paginated users:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const users = await searchUsersService(req.query.query);
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error searching users:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const user = await updateUserService(req.params.id, req.body);
        return res.status(200).json(user);
    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const result = await deleteUserService(req.params.id);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const getUserBusiness = async (req, res) => {
    try {
        const business = await getUserBusinessService(req.params.id);
        return res.status(200).json(business);
    } catch (error) {
        console.error("Error fetching user's business:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const addSystemAdmin = async (req, res) => {
    try {
        const result = await addSystemAdminService(req.body.userId);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error promoting user to system admin:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};