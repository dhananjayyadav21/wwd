const express = require("express");
const router = express.Router();
const {
  getAllDetailsController,
  registerAdminController,
  updateDetailsController,
  deleteDetailsController,
  loginAdminController,
  getMyDetailsController,
  sendForgetPasswordEmail,
  updatePasswordHandler,
  updateLoggedInPasswordController,
} = require("../../controllers/details/admin-details.controller");
const upload = require("../../middlewares/multer.middleware");
const auth = require("../../middlewares/auth.middleware");
const isAdmin = require("../../middlewares/isAdmin.middleware");

router.post("/register", auth, isAdmin, upload.single("file"), registerAdminController);
router.post("/login", loginAdminController);
router.get("/my-details", auth, getMyDetailsController);

router.get("/", auth, isAdmin, getAllDetailsController);
router.patch("/:id", auth, isAdmin, upload.single("file"), updateDetailsController);
router.delete("/:id", auth, isAdmin, deleteDetailsController);
router.post("/forget-password", sendForgetPasswordEmail);
router.post("/update-password/:resetId", updatePasswordHandler);
router.post("/change-password", auth, updateLoggedInPasswordController);

module.exports = router;
