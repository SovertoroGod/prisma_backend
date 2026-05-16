
const normalizeRole = (role) => String(role || "").trim().toLowerCase();

exports.authorize = (...roles) => {
    const allowedRoles = roles.flat().map(normalizeRole).filter(Boolean);

    return (req, res, next) => {
        const userRole = normalizeRole(req.user && req.user.role);

        if (!userRole) {
            return res.status(401).json({ success: false, message: "Unauthorized." });
        }

        if (allowedRoles.length === 0) {
            return res.status(403).json({ success: false, message: "Access denied." });
        }

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ success: false, message: "Access denied." });
        }

        next();
    };
};

exports.isAdmin = exports.authorize("admin");
exports.isManager = exports.authorize("manager");
exports.isCashier = exports.authorize("cashier");
