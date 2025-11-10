const mongoose = require("mongoose");
const Student = require("../models/details/student-details.model");
const Exam = require("../models/exam.model");
const Marks = require("../models/marks.model");

/* Student Aspiring Distribution (Batch-wise / All) */
const getAspiringDistribution = async (req, res) => {
    try {
        const { batch } = req.query;
        const match = {};
        if (batch) match["branchId"] = new mongoose.Types.ObjectId(batch);

        const data = await Student.aggregate([
            { $match: match },
            { $group: { _id: "$aspiring", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        res.json({ success: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error in aspiring distribution" });
    }
};

/* Exams by Type Count (Batch filter) */
const getExamTypeCount = async (req, res) => {
    try {
        const match = {};

        const data = await Exam.aggregate([
            { $match: match },
            { $group: { _id: "$examType", count: { $sum: 1 } } },
        ]);

        res.json({ success: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error in exam type count" });
    }
};


/* Average Marks by Field (Batch + Exam filter) */
const getAvgMarksByField = async (req, res) => {
    try {
        const { batch, examType } = req.query;
        const match = {};
        if (batch) match["student.branchId"] = new mongoose.Types.ObjectId(batch);
        if (examType) match["exam.name"] = examType;

        const basePipeline = [
            // Join student
            {
                $lookup: {
                    from: "studentdetails",
                    localField: "studentId",
                    foreignField: "_id",
                    as: "student",
                },
            },
            { $unwind: "$student" },

            // Join exam
            {
                $lookup: {
                    from: "exams",
                    localField: "examId",
                    foreignField: "_id",
                    as: "exam",
                },
            },
            { $unwind: "$exam" },

            // Apply filters
            { $match: match },
        ];

        // 1️⃣ Average by Aspiring (per student first → then per aspiring)
        const aspiringData = await Marks.aggregate([
            ...basePipeline,
            {
                $group: {
                    _id: { studentId: "$studentId", aspiring: "$student.aspiring" },
                    studentAvg: { $avg: "$marksObtained" },
                    studentHighest: { $max: "$marksObtained" },
                },
            },
            {
                $group: {
                    _id: "$_id.aspiring",
                    avgMarks: { $avg: "$studentAvg" },
                    highestMarks: { $max: "$studentHighest" },
                    totalStudents: { $sum: 1 },
                },
            },
            {
                $project: {
                    avgMarks: { $round: ["$avgMarks", 2] },
                    highestMarks: { $round: ["$highestMarks", 2] },
                    totalStudents: 1,
                },
            },
            { $sort: { avgMarks: -1 } },
        ]);

        // 2️⃣ Average by Exam
        const examData = await Marks.aggregate([
            ...basePipeline,
            {
                $group: {
                    _id: "$exam.name",
                    avgMarks: { $avg: "$marksObtained" },
                    highestMarks: { $max: "$marksObtained" },
                    totalStudents: { $addToSet: "$studentId" },
                },
            },
            {
                $project: {
                    avgMarks: { $round: ["$avgMarks", 2] },
                    highestMarks: { $round: ["$highestMarks", 2] },
                    totalStudents: { $size: "$totalStudents" },
                },
            },
            { $sort: { avgMarks: -1 } },
        ]);

        res.json({
            success: true,
            data: {
                byAspiring: aspiringData,
                byExam: examData,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error in avg marks" });
    }
};


/*  Marks Range Distribution (Batch + Exam) */
const getMarksRangeDistribution = async (req, res) => {
    try {
        const { batch, examType } = req.query;
        const match = {};
        if (batch) match["student.branchId"] = new mongoose.Types.ObjectId(batch);
        if (examType) match["exam.name"] = examType;

        const data = await Marks.aggregate([
            {
                $lookup: {
                    from: "studentdetails",
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
            { $match: match },
            {
                $bucket: {
                    groupBy: "$marksObtained",
                    boundaries: [0, 20, 40, 60, 80, 100],
                    default: "100+",
                    output: { count: { $sum: 1 } },
                },
            },
            {
                $project: {
                    _id: 1,
                    count: 1,
                    rangeLabel: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$_id", 0] }, then: "0–20" },
                                { case: { $eq: ["$_id", 20] }, then: "20–40" },
                                { case: { $eq: ["$_id", 40] }, then: "40–60" },
                                { case: { $eq: ["$_id", 60] }, then: "60–80" },
                                { case: { $eq: ["$_id", 80] }, then: "80–100" }
                            ],
                            default: "100+"
                        }
                    }
                }
            }

        ]);

        res.json({ success: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error in marks range" });
    }
};

/* Top Performing Aspiring Field + Leaderboard (Batch + Exam) */
const getTopPerforming = async (req, res) => {
    try {
        const { batch, examType } = req.query;
        const match = {};
        if (batch) match["student.branchId"] = new mongoose.Types.ObjectId(batch);
        if (examType) match["exam.name"] = examType;

        const data = await Marks.aggregate([
            // Join student details
            {
                $lookup: {
                    from: "studentdetails",
                    localField: "studentId",
                    foreignField: "_id",
                    as: "student",
                },
            },
            { $unwind: "$student" },

            // Join exam details
            {
                $lookup: {
                    from: "exams",
                    localField: "examId",
                    foreignField: "_id",
                    as: "exam",
                },
            },
            { $unwind: "$exam" },

            // Apply filters (batch, examType)
            { $match: match },

            // Group by student to calculate their total/average marks
            {
                $group: {
                    _id: "$studentId",
                    firstName: { $first: "$student.firstName" },
                    middleName: { $first: "$student.middleName" },
                    lastName: { $first: "$student.lastName" },
                    aspiring: { $first: "$student.aspiring" },
                    totalMarks: { $sum: "$marksObtained" },
                    avgMarks: { $avg: "$marksObtained" },
                },
            },

            // Sort by average marks (descending)
            { $sort: { avgMarks: -1 } },
        ]);

        // Build a field-wise leaderboard grouping
        const grouped = data.reduce((acc, curr) => {
            if (!acc[curr.aspiring]) acc[curr.aspiring] = [];
            acc[curr.aspiring].push(curr);
            return acc;
        }, {});

        // For each field, pick top 5 students
        const leaderboard = Object.entries(grouped).map(([field, students]) => ({
            field,
            topStudents: students.slice(0, 5).map(s => ({
                name: [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" "),
                totalMarks: s.totalMarks,
                avgMarks: Math.round(s.avgMarks * 100) / 100,
            })),
        }));

        res.json({
            success: true,
            filters: { batch, examType },
            leaderboard,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Error generating leaderboard",
        });
    }
};


module.exports = {
    getAspiringDistribution,
    getExamTypeCount,
    getAvgMarksByField,
    getMarksRangeDistribution,
    getTopPerforming,
};
