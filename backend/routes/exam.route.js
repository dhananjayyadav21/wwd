const express = require("express");
const {
  getAllExamsController,
  addExamController,
  updateExamController,
  deleteExamController,
} = require("../controllers/exam.controller");

const auth = require("../middlewares/auth.middleware");
const isAdminOrFaculty = require("../middlewares/isAdminOrFaculty.middleware");

const router = express.Router();
const upload = require("../middlewares/multer.middleware");

router.get("/", auth, getAllExamsController);
router.post("/", auth, isAdminOrFaculty, upload.single("file"), addExamController);
router.patch("/:id", auth, isAdminOrFaculty, upload.single("file"), updateExamController);
router.delete("/:id", auth, isAdminOrFaculty, deleteExamController);

module.exports = router;
