const Timetable = require("../models/timetable.model");
const ApiResponse = require("../utils/ApiResponse");

// -------------------- Get All Timetables --------------------
const getTimetableController = async (req, res) => {
  try {
    const { branch } = req.query;
    const query = {};

    if (branch) query.branch = branch;

    const timetables = await Timetable.find(query)
      .populate("branch")
      .sort({ createdAt: -1 });

    if (!timetables || timetables.length === 0) {
      return ApiResponse.notFound("No timetables found").send(res);
    }

    return ApiResponse.success(
      timetables,
      "Timetables retrieved successfully"
    ).send(res);
  } catch (error) {
    console.error("Get Timetable Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

// -------------------- Add Timetable --------------------
const addTimetableController = async (req, res) => {
  try {
    const { branch, link } = req.body;

    if (!branch || !link) {
      return ApiResponse.badRequest("Branch and link are required").send(res);
    }

    // Check if a timetable already exists for this branch
    let timetable = await Timetable.findOne({ branch });

    if (timetable) {
      timetable = await Timetable.findByIdAndUpdate(
        timetable._id,
        { branch, link },
        { new: true }
      );
      return ApiResponse.success(timetable, "Timetable updated successfully").send(res);
    }

    timetable = await Timetable.create({ branch, link });

    return ApiResponse.created(timetable, "Timetable added successfully").send(res);
  } catch (error) {
    console.error("Add Timetable Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

// -------------------- Update Timetable --------------------
const updateTimetableController = async (req, res) => {
  try {
    const { id } = req.params;
    const { branch, link } = req.body;

    if (!id) {
      return ApiResponse.badRequest("Timetable ID is required").send(res);
    }

    const timetable = await Timetable.findByIdAndUpdate(
      id,
      { branch, link },
      { new: true }
    );

    if (!timetable) {
      return ApiResponse.notFound("Timetable not found").send(res);
    }

    return ApiResponse.success(timetable, "Timetable updated successfully").send(res);
  } catch (error) {
    console.error("Update Timetable Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

// -------------------- Delete Timetable --------------------
const deleteTimetableController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return ApiResponse.badRequest("Timetable ID is required").send(res);
    }

    const timetable = await Timetable.findByIdAndDelete(id);

    if (!timetable) {
      return ApiResponse.notFound("Timetable not found").send(res);
    }

    return ApiResponse.success(null, "Timetable deleted successfully").send(res);
  } catch (error) {
    console.error("Delete Timetable Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

module.exports = {
  getTimetableController,
  addTimetableController,
  updateTimetableController,
  deleteTimetableController,
};
