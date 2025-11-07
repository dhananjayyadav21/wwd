const Exam = require("../models/exam.model");
const ApiResponse = require("../utils/ApiResponse");
const StudentDetails = require("../models/details/student-details.model");
const sendExamMail = require("../utils/sendExamMail");

const getAllExamsController = async (req, res) => {
  try {
    const { search = "", examType = "", semester = "" } = req.query;

    let query = {};

    if (semester) query.semester = semester;
    if (examType) query.examType = examType;

    const exams = await Exam.find(query);

    if (!exams || exams.length === 0) {
      return ApiResponse.error("No Exams Found", 404).send(res);
    }

    return ApiResponse.success(exams, "All Exams Loaded!").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};

const addExamController = async (req, res) => {
  try {
    const { name, date, examType, totalMarks } = req.body;

    // Validation
    if (!name || !date || !examType || !totalMarks) {
      return ApiResponse.error("All fields are required", 400).send(res);
    }

    // File handling
    const formData = req.body;
    if (req.file) {
      formData.timetableLink = req.file.filename;
    }

    // Create exam record
    const exam = await Exam.create(formData);

    // ===== Get all student emails =====
    const students = await StudentDetails.find({}, "email");
    const studentEmails = students.map((s) => s.email);

    // ===== Send exam emails =====
    for (const email of studentEmails) {
      await sendExamMail(email, {
        name,
        date,
        examType,
        totalMarks,
        timetableLink: formData.timetableLink || null,
      });
    }

    // Response
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
      formData.timetableLink = req.file.filename;
    }
    const exam = await Exam.findByIdAndUpdate(req.params.id, formData, {
      new: true,
    });
    return ApiResponse.success(exam, "Exam Updated Successfully!").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};

const deleteExamController = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
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
