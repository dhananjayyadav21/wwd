const Notice = require("../models/notice.model");
const ApiResponse = require("../utils/ApiResponse");
const Admin = require("../models/details/admin-details.model")
const Student = require("../models/details/student-details.model");
const Faculty = require("../models/details/faculty-details.model");
const sendNoticeMail = require("../utils/sendNoticeMail");

const getNoticeController = async (req, res) => {
  try {
    const userId = req.userId;

    let userRole = null;

    // Check if faculty
    const faculty = await Faculty.findById(userId);
    if (faculty) userRole = "faculty";

    // Check if student
    const student = await Student.findById(userId);
    if (student) userRole = "student";

    // Default to admin if not student/faculty
    const admin = await Admin.findById(userId);
    if (admin) userRole = "admin";

    let notices = [];

    if (userRole === "admin") {
      // Admin gets all notices
      notices = await Notice.find({});
    } else {
      // Student / Faculty gets notices for their role or for all
      notices = await Notice.find({
        $or: [{ type: userRole }, { type: "both" }]
      });
    }

    if (!notices || notices.length === 0) {
      return ApiResponse.error("No Notices Found", 404).send(res);
    }

    // If user is faculty, tag notices created by them
    if (userRole === "faculty") {
      notices = notices.map((n) => {
        const notice = n.toObject ? n.toObject() : n;

        const createdById = notice.createdBy ? notice.createdBy.toString() : null;
        // safely compare
        const isCreatedByMe = createdById && createdById === userId.toString();

        return {
          ...notice,
          isCreatedByMe,
        };
      });
    }

    return ApiResponse.success(notices, "All Notices Loaded!").send(res);

  } catch (error) {
    console.error("Error in getNoticeController:", error);
    return ApiResponse.error(error.message).send(res);
  }
};

const addNoticeController = async (req, res) => {
  const { title, description, type, link } = req.body;
  const userId = req.userId;

  let userRole = null

  // check if Admin
  const admin = await Admin.findById(userId);
  if (admin) {
    userRole = "AdminDetail"
  }

  // check if faculty
  const faculty = await Faculty.findById(userId);
  if (faculty) {
    userRole = "FacultyDetail"
  }


  if (!title || !description || !type) {
    return ApiResponse.error("All fields are required", 400).send(res);
  }

  if (userRole !== "AdminDetail" && userRole !== "FacultyDetail") {
    return ApiResponse.error("Only Admins or Faculty can add notices", 403).send(res);
  }

  try {
    const notice = await Notice.create({
      title,
      description,
      type,
      link,
      createdBy: userId,
      createdByRole: userRole,
    });

    // Determine recipients
    let recipients = [];
    if (type === "student") {
      recipients = await Student.find();
    } else if (type === "faculty") {
      recipients = await Faculty.find();
    } else if (type === "both") {
      const students = await Student.find();
      const faculties = await Faculty.find();
      recipients = [...students, ...faculties];
    }

    // Send emails
    if (recipients.length > 0) {
      await Promise.all(
        recipients.map((user) =>
          sendNoticeMail(user.email, title, description, link)
        )
      );
    }

    return ApiResponse.created(notice, "Notice added successfully!").send(res);
  } catch (error) {
    console.error("Error adding notice:", error);
    return ApiResponse.error(error.message).send(res);
  }
};

const updateNoticeController = async (req, res) => {
  const { title, description, type, link } = req.body;
  const userId = req.userId;
  let userRole = null

  // check if Admin
  const admin = await Admin.findById(userId);
  if (admin) {
    userRole = "AdminDetail"
  }

  // check if faculty
  const faculty = await Faculty.findById(userId);
  if (faculty) {
    userRole = "FacultyDetail"
  }

  const isSuperAdmin = admin?.isSuperAdmin || false;
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return ApiResponse.error("Notice not found", 404).send(res);
    }

    // Check permissions: only creator or super admin can edit
    const isCreator = notice.createdBy.toString() === userId.toString();
    if (!isCreator && !(userRole === "AdminDetail" && isSuperAdmin)) {
      return ApiResponse.error("You are not authorized to update this notice", 403).send(res);
    }

    // Apply updates
    if (title) notice.title = title;
    if (description) notice.description = description;
    if (type) notice.type = type;
    if (link) notice.link = link;

    await notice.save();

    // Send notification emails (optional)
    let recipients = [];
    if (type === "student") {
      recipients = await Student.find();
    } else if (type === "faculty") {
      recipients = await Faculty.find();
    } else if (type === "both") {
      const students = await Student.find();
      const faculties = await Faculty.find();
      recipients = [...students, ...faculties];
    }

    if (recipients.length > 0) {
      await Promise.all(
        recipients.map((user) =>
          sendNoticeMail(user.email, title, description, link)
        )
      );
    }

    return ApiResponse.success(notice, "Notice updated successfully!").send(res);
  } catch (error) {
    console.error("Error updating notice:", error);
    return ApiResponse.error(error.message).send(res);
  }
};


const deleteNoticeController = async (req, res) => {
  try {
    if (!req.params.id) {
      return ApiResponse.error("Notice ID is required", 400).send(res);
    }

    let notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) {
      return ApiResponse.error("Notice Not Found!", 404).send(res);
    }
    return ApiResponse.success(null, "Notice Deleted Successfully!").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};

module.exports = {
  getNoticeController,
  addNoticeController,
  updateNoticeController,
  deleteNoticeController,
};
