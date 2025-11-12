const FacultyDetail = require("../models/details/faculty-details.model");
const AdminDetail = require("../models/details/admin-details.model");
const ApiResponse = require("../utils/ApiResponse");

const isFacultyOrAdmin = async (req, res, next) => {
    try {
        // Ensure auth middleware ran before
        if (!req.userId) {
            return ApiResponse.unauthorized("User not authenticated").send(res);
        }

        // Try to find as Admin first
        const admin = await AdminDetail.findById(req.userId);
        if (admin && admin.status === "active") {
            // Optionally check if admin has super privileges
            if (admin.isSuperAdmin) {
                req.userRole = "admin";
                req.admin = admin;
                return next();
            }
        }

        // Try to find as Faculty
        const faculty = await FacultyDetail.findById(req.userId);
        if (faculty && faculty.status === "active") {
            req.userRole = "faculty";
            req.faculty = faculty;
            return next();
        }

        // If neither admin nor faculty found or active
        return ApiResponse.forbidden("Access denied. Only active Faculty or Admin can access this route.").send(res);

    } catch (error) {
        console.error("isFacultyOrAdmin Middleware Error:", error);
        return ApiResponse.internalError("Error verifying Faculty or Admin access").send(res);
    }
};

module.exports = isFacultyOrAdmin;
