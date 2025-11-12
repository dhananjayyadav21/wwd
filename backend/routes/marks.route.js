const express = require("express");
const {
  getMarksController,
  addMarksController,
  deleteMarksController,
  addBulkMarksController,
  getStudentsWithMarksController,
  getStudentMarksController,
} = require("../controllers/marks.controller");
const auth = require("../middlewares/auth.middleware");
const isAdminOrFaculty = require("../middlewares/isAdminOrFaculty.middleware");

const router = express.Router();
const upload = require("../middlewares/multer.middleware");

router.get("/", auth, getMarksController);
router.get("/students", auth, getStudentsWithMarksController);
router.get("/student", auth, getStudentMarksController);
router.post("/", auth, isAdminOrFaculty, addMarksController);
router.post("/bulk", auth, isAdminOrFaculty, addBulkMarksController);
router.delete("/:id", auth, isAdminOrFaculty, deleteMarksController);

module.exports = router;
