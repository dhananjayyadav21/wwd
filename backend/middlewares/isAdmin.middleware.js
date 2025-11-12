const AdminDetail = require("../models/details/admin-details.model");
const ApiResponse = require("../utils/ApiResponse");

const isAdmin = async (req, res, next) => {
    try {
        // Ensure auth middleware ran before
        if (!req.userId) {
            return ApiResponse.unauthorized("User not authenticated").send(res);
        }

        // Find admin by userId from token
        const admin = await AdminDetail.findById(req.userId);

        if (!admin) {
            return ApiResponse.notFound("You are not found as admin").send(res);
        }

        // Check admin privileges
        if (!admin.isSuperAdmin) {
            return ApiResponse.forbidden("Access denied. Admin privileges required.").send(res);
        }

        // Attach admin info for downstream usage
        req.admin = admin;
        next();
    } catch (error) {
        console.error("isAdmin Middleware Error:", error);
        return ApiResponse.internalError("Error verifying admin access").send(res);
    }
};

module.exports = isAdmin;
