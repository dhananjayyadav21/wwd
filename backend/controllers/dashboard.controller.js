const mongoose = require("mongoose");
const Student = require("../models/details/student-details.model");
const Faculty = require("../models/details/faculty-details.model");
const Admin = require("../models/details/admin-details.model");
const Exam = require("../models/exam.model");
const Marks = require("../models/marks.model");

const getDashboardStats = async (req, res) => {
    try {
        const { branch, subjectId, examType } = req.query;
        const matchStage = {};

        // branch filter -> use branchId (ObjectId)
        if (branch) matchStage["student.branchId"] = new mongoose.Types.ObjectId(branch);
        if (subjectId) matchStage.subjectId = new mongoose.Types.ObjectId(subjectId);
        if (examType) matchStage["exam.examType"] = examType;

        // Student aspiring distribution
        const studentAspiringStats = await Student.aggregate([
            { $group: { _id: "$aspiring", count: { $sum: 1 } } },
        ]);

        // Count totals
        const [facultyCount, studentCount, adminCount] = await Promise.all([
            Faculty.countDocuments({ status: "active" }),
            Student.countDocuments({ status: "active" }),
            Admin.countDocuments({}),
        ]);

        // Exam type stats (mid, end)
        const examTypeStats = await Exam.aggregate([
            { $group: { _id: "$examType", count: { $sum: 1 } } },
        ]);

        // Average marks by aspiring field
        const avgMarksByAspiring = await Marks.aggregate([
            {
                $lookup: {
                    from: "studentdetails", // collection name (lowercase + pluralized)
                    localField: "studentId",
                    foreignField: "_id",
                    as: "student",
                },
            },
            { $unwind: "$student" },
            {
                $lookup: {
                    from: "exams",
                    localField: "examId",
                    foreignField: "_id",
                    as: "exam",
                },
            },
            { $unwind: "$exam" },
            { $match: matchStage },
            {
                $group: {
                    _id: "$student.aspiring",
                    avgMarks: { $avg: "$marksObtained" },
                    highestMarks: { $max: "$marksObtained" },
                    totalStudents: { $sum: 1 },
                },
            },
            { $sort: { avgMarks: -1 } },
        ]);

        // Marks range bucket
        const marksRange = await Marks.aggregate([
            {
                $bucket: {
                    groupBy: "$marksObtained",
                    boundaries: [0, 20, 40, 60, 80, 100],
                    default: "100+",
                    output: { count: { $sum: 1 } },
                },
            },
        ]);

        const topAspiring = avgMarksByAspiring.length ? avgMarksByAspiring[0]._id : "N/A";

        const upcomingExams = await Exam.find()
            .sort({ date: 1 })
            .limit(5)
            .select("name date examType aspiring totalMarks");

        res.json({
            success: true,
            data: {
                totalAdmins: adminCount,
                totalFaculties: facultyCount,
                totalStudents: studentCount,
                studentAspiringStats,
                examTypeStats,
                avgMarksByAspiring,
                marksRange,
                topAspiring,
                upcomingExams,
            },
        });
    } catch (error) {
        console.error("Error in getDashboardStats:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getDashboardStats };
