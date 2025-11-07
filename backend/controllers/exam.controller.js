const Exam = require("../models/exam.model");
const ApiResponse = require("../utils/ApiResponse");
const StudentDetails = require("../models/details/student-details.model");
const sendExamMail = require("../utils/sendExamMail");

const getAllExamsController = async (req, res) => {
  try {
    const { search = "", examType = "" } = req.query;

    let query = {};
    if (examType) query.examType = examType;

    // Optional: search filter by name (case-insensitive)
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const exams = await Exam.find(query).sort({ date: -1 });

    if (!exams.length) {
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

    if (!name || !date || !examType || !totalMarks) {
      return ApiResponse.error("All fields are required", 400).send(res);
    }

    const formData = { name, date, examType, totalMarks };

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
