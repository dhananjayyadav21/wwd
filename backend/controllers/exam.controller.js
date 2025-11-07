const Exam = require("../models/exam.model");
const ApiResponse = require("../utils/ApiResponse");
const StudentDetails = require("../models/details/student-details.model");
const facultyDetails = require("../models/details/faculty-details.model");
const adminDetails = require("../models/details/admin-details.model");
const sendExamMail = require("../utils/sendExamMail");

const getAllExamsController = async (req, res) => {
  try {
    const { search = "", examType = "" } = req.query;
    const userId = req.userId;

    // Check who the user is (Faculty, Admin, or Student)
    let role = "student";
    let aspiring = null;

    // Check Faculty first
    const faculty = await facultyDetails.findById(userId);
    if (faculty) {
      role = "faculty";
    } else {
      // Check SuperAdmin or Admin in your main User model
      const admin = await adminDetails.findById(userId);
      if (admin && admin.isSuperAdmin) {
        role = "superadmin";
      } else {
        // If neither, it's a student
        const student = await StudentDetails.findById(userId);
        if (!student) {
          return ApiResponse.error("User not found", 404).send(res);
        }
        aspiring = student.aspiring;
      }
    }

    // Step 2: Build base query
    let query = {};

    // If student, only filter by their aspiring field
    if (role === "student") {
      query.aspiring = aspiring;
    }

    // Optional filters
    if (examType) query.examType = examType;
    if (search) query.name = { $regex: search, $options: "i" };

    // Step 3: Fetch exams
    const exams = await Exam.find(query).sort({ date: -1 });

    if (!exams.length) {
      return ApiResponse.error("No exams found", 404).send(res);
    }

    // Step 4: Send success response
    return ApiResponse.success(
      exams,
      `Exams loaded successfully for ${role}`
    ).send(res);
  } catch (error) {
    console.error("Error in getAllExamsController:", error);
    return ApiResponse.error(error.message).send(res);
  }
};

const addExamController = async (req, res) => {
  try {
    const { name, date, examType, aspiring, totalMarks } = req.body;

    if (!name || !date || !examType || !aspiring || !totalMarks) {
      return ApiResponse.error("All fields are required", 400).send(res);
    }

    const formData = { name, date, examType, aspiring, totalMarks };

    // if file is uploaded, store filename as examLink
    if (req.file) {
      formData.examLink = req.file.filename;
    }

    // Create exam entry
    const exam = await Exam.create(formData);

    // Get student emails only
    const students = await StudentDetails.find({}, "email");
    const studentEmails = students.map((s) => s.email);

    // Send mail to each student
    for (const email of studentEmails) {
      await sendExamMail(email, {
        name,
        date,
        examType,
        aspiring,
        totalMarks,
        examLink: formData.examLink || "",
      });
    }

    return ApiResponse.success(exam, "Exam added and emails sent to all students successfully!").send(res);
  } catch (error) {
    console.error("Error adding exam:", error);
    return ApiResponse.error(error.message).send(res);
  }
};

const updateExamController = async (req, res) => {
  try {
    const formData = req.body;
    if (req.file) {
      formData.examLink = req.file.filename;
    }

    const exam = await Exam.findByIdAndUpdate(req.params.id, formData, {
      new: true,
    });

    if (!exam) return ApiResponse.error("Exam not found", 404).send(res);

    return ApiResponse.success(exam, "Exam Updated Successfully!").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};

const deleteExamController = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);

    if (!exam) return ApiResponse.error("Exam not found", 404).send(res);

    return ApiResponse.success(exam, "Exam Deleted Successfully!").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};

module.exports = {
  getAllExamsController,
  addExamController,
  updateExamController,
  deleteExamController,
};
