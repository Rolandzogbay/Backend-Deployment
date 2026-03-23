import {
    createBusinessService,
    deleteBusinessService,
    getAllBusinessesService,
    getBusinessByIdService,
    getBusinessUsersService,
    getBusinessesPaginatedService,
    safeUserResponse,
    searchBusinessesService,
    setRefreshCookie,
    updateBusinessService,
} from "../services/business.services.js";

export const getAllBusinesses = async (req, res) => {
    try {
        const businesses = await getAllBusinessesService();
        return res.status(200).json(businesses);
    } catch (error) {
        console.error("Error fetching businesses:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const getBusinessById = async (req, res) => {
    try {
        const business = await getBusinessByIdService(req.params.id);
        return res.status(200).json(business);
    } catch (error) {
        console.error("Error fetching business:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const createBusiness = async (req, res) => {
    try {
        const result = await createBusinessService(req.body);

        setRefreshCookie(res, result.refreshToken);

        return res.status(201).json({
            message: "Business and user registered successfully",
            token: result.accessToken,
            user: safeUserResponse(result.user, result.business),
        });
    } catch (error) {
        console.error("Error creating business:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const searchBusinesses = async (req, res) => {
    try {
        const businesses = await searchBusinessesService(req.query.query);
        return res.status(200).json(businesses);
    } catch (error) {
        console.error("Error searching businesses:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const getBusinessesPaginated = async (req, res) => {
    try {
        const result = await getBusinessesPaginatedService(req.query.page, req.query.limit);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching paginated businesses:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const updateBusiness = async (req, res) => {
    try {
        const business = await updateBusinessService(req.params.id, req.body);
        return res.status(200).json(business);
    } catch (error) {
        console.error("Error updating business:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const getBusinessUsers = async (req, res) => {
    try {
        const users = await getBusinessUsersService(req.params.id);
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching business users:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const deleteBusiness = async (req, res) => {
    try {
        const result = await deleteBusinessService(req.params.id);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error deleting business:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
};