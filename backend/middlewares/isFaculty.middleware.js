const FacultyDetail = require("../models/details/faculty-details.model");
const ApiResponse = require("../utils/ApiResponse");

const isFaculty = async (req, res, next) => {
    try {
        // Ensure auth middleware ran before
        if (!req.userId) {
            return ApiResponse.unauthorized("User not authenticated").send(res);
        }

        // Find faculty by userId from token
        const faculty = await FacultyDetail.findById(req.userId);

        if (!faculty) {
            return ApiResponse.notFound("You are not found as faculty").send(res);
        }

        // Check faculty privileges
        if (!faculty.isFaculty) {
            return ApiResponse.forbidden("Access denied. faculty privileges required.").send(res);
        }

        // Optional: check status (if applicable)
        if (faculty.status && faculty.status !== "active") {
            return ApiResponse.forbidden("Your faculty account is inactive").send(res);
        }

        // Attach faculty info for downstream usage
        req.faculty = faculty;
        next();
    } catch (error) {
        console.error("isFaculty Middleware Error:", error);
        return ApiResponse.internalError("Error verifying faculty access").send(res);
    }
};

module.exports = isFaculty;
