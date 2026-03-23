export const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        const currentRole = String(req.user?.role || "").trim().toLowerCase();
        const normalizedAllowedRoles = allowedRoles.map((role) =>
            String(role).trim().toLowerCase()
        );
        console.log(req.user?.role)

        if (!currentRole) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!normalizedAllowedRoles.includes(currentRole)) {
            return res.status(403).json({
                message: "Forbidden: insufficient permissions",
                currentRole,
                allowedRoles: normalizedAllowedRoles,
            });
        }
        return next();
    };
};