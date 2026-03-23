import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7)
            : null;

        if (!token) {
            return res.status(401).json({ message: "Missing access token" });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            userId: payload.userId,
            businessId: payload.businessId,
            role: payload.role,
        };

        return next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired access token" });
    }
};