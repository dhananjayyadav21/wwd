const express = require("express");
const router = express.Router();
const {
  loginStudentController,
  getAllDetailsController,
  registerStudentController,
  updateDetailsController,
  deleteDetailsController,
  getMyDetailsController,
  sendForgetPasswordEmail,
  updatePasswordHandler,
  searchStudentsController,
  updateLoggedInPasswordController,
} = require("../../controllers/details/student-details.controller");
const upload = require("../../middlewares/multer.middleware");
const auth = require("../../middlewares/auth.middleware");
const isAdmin = require("../../middlewares/isAdmin.middleware")

router.post("/register", auth, isAdmin, upload.single("file"), registerStudentController);
router.post("/login", loginStudentController);
router.get("/my-details", auth, getMyDetailsController);

router.get("/", auth, getAllDetailsController);
router.patch("/:id", auth, isAdmin, upload.single("file"), updateDetailsController);
router.delete("/:id", auth, isAdmin, deleteDetailsController);
router.post("/forget-password", sendForgetPasswordEmail);
router.post("/update-password/:resetId", updatePasswordHandler);
router.post("/change-password", auth, updateLoggedInPasswordController);
router.post("/search", auth, searchStudentsController);

module.exports = router;
