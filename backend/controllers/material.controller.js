const Material = require("../models/material.model");
const ApiResponse = require("../utils/ApiResponse");

/**
 * Get all materials with optional filters
 */
const getMaterialsController = async (req, res) => {
  try {
    const { subject, faculty, branch, type, fromDate, toDate } = req.query;
    const query = {};

    if (subject) query.subject = subject;
    if (faculty) query.faculty = faculty;
    if (branch) query.branch = branch;
    if (type) query.type = type;

    // Date filter
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    const materials = await Material.find(query)
      .populate("subject", "name code")
      .populate("faculty", "name email")
      .populate("branch", "name code")
      .sort({ createdAt: -1 });

    if (!materials || materials.length === 0) {
      return ApiResponse.notFound("No materials found").send(res);
    }

    return ApiResponse.success(materials, "Materials retrieved successfully").send(res);
  } catch (error) {
    console.error("Get Materials Error:", error);
    return ApiResponse.internalServerError(error.message).send(res);
  }
};

/**
 * Add new material (link-based)
 */
const addMaterialController = async (req, res) => {
  try {
    const { title, subject, branch, type, materialLink } = req.body;

    // Validate required fields
    if (!title || !subject || !branch || !type || !materialLink) {
      return ApiResponse.badRequest("All fields are required").send(res);
    }

    if (!["notes", "assignment", "syllabus", "other"].includes(type)) {
      return ApiResponse.badRequest("Invalid material type").send(res);
    }

    // Create material entry
    const material = await Material.create({
      title,
      subject,
      branch,
      type,
      materialLink,
      faculty: req.userId, // from auth middleware
    });

    const populatedMaterial = await Material.findById(material._id)
      .populate("subject", "name code")
      .populate("faculty", "name email")
      .populate("branch", "name code");

    return ApiResponse.created(populatedMaterial, "Material added successfully").send(res);
  } catch (error) {
    console.error("Add Material Error:", error);
    return ApiResponse.internalServerError(error.message).send(res);
  }
};

/**
 * Update material (link-based)
 */
const updateMaterialController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subject, branch, type, materialLink } = req.body;

    if (!id) {
      return ApiResponse.badRequest("Material ID is required").send(res);
    }

    const material = await Material.findById(id);

    if (!material) {
      return ApiResponse.notFound("Material not found").send(res);
    }

    // Check if the logged-in faculty owns this material
    if (material.faculty.toString() !== req.userId) {
      return ApiResponse.unauthorized("You are not authorized to update this material").send(res);
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (subject) updateData.subject = subject;
    if (branch) updateData.branch = branch;
    if (materialLink) updateData.materialLink = materialLink;
    if (type) {
      if (!["notes", "assignment", "syllabus", "other"].includes(type)) {
        return ApiResponse.badRequest("Invalid material type").send(res);
      }
      updateData.type = type;
    }

    const updatedMaterial = await Material.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("subject", "name code")
      .populate("faculty", "name email")
      .populate("branch", "name code");

    return ApiResponse.success(updatedMaterial, "Material updated successfully").send(res);
  } catch (error) {
    console.error("Update Material Error:", error);
    return ApiResponse.internalServerError(error.message).send(res);
  }
};

/**
 * Delete material
 */
const deleteMaterialController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return ApiResponse.badRequest("Material ID is required").send(res);
    }

    const material = await Material.findById(id);

    if (!material) {
      return ApiResponse.notFound("Material not found").send(res);
    }

    // Only the faculty who uploaded it can delete
    if (material.faculty.toString() !== req.userId) {
      return ApiResponse.unauthorized("You are not authorized to delete this material").send(res);
    }

    await Material.findByIdAndDelete(id);

    return ApiResponse.success(null, "Material deleted successfully").send(res);
  } catch (error) {
    console.error("Delete Material Error:", error);
    return ApiResponse.internalServerError(error.message).send(res);
  }
};

module.exports = {
  getMaterialsController,
  addMaterialController,
  updateMaterialController,
  deleteMaterialController,
};
