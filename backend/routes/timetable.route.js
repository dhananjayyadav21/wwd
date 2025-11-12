require("dotenv").config();
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer.middleware");
const auth = require("../middlewares/auth.middleware");
const isAdminOrFaculty = require("../middlewares/isAdminOrFaculty.middleware");

const {
  getTimetableController,
  addTimetableController,
  updateTimetableController,
  deleteTimetableController,
} = require("../controllers/timetable.controller");

router.get("/", auth, getTimetableController);

router.post("/", auth, isAdminOrFaculty, upload.single("file"), addTimetableController);

router.put("/:id", auth, isAdminOrFaculty, upload.single("file"), updateTimetableController);

router.delete("/:id", auth, isAdminOrFaculty, deleteTimetableController);

module.exports = router;
