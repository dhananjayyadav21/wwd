const express = require("express");
const router = express.Router();
const {
    getAspiringDistribution,
    getExamTypeCount,
    getAvgMarksByField,
    getMarksRangeDistribution,
    getTopPerforming,
} = require("../controllers/dashboard.controller");

// Each graph → its own endpoint
router.get("/aspiring-distribution", getAspiringDistribution);
router.get("/exam-type-count", getExamTypeCount);
router.get("/avg-marks-field", getAvgMarksByField);
router.get("/marks-range", getMarksRangeDistribution);
router.get("/top-performing", getTopPerforming);

module.exports = router;
