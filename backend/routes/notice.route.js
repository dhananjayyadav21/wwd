const express = require("express");
const {
  getNoticeController,
  addNoticeController,
  updateNoticeController,
  deleteNoticeController,
} = require("../controllers/notice.controller");
const auth = require("../middlewares/auth.middleware");
const isAdminOrFaculty = require("../middlewares/isAdminOrFaculty.middleware");

const router = express.Router();

router.get("/", auth, getNoticeController);
router.post("/", auth, isAdminOrFaculty, addNoticeController);
router.put("/:id", auth, isAdminOrFaculty, updateNoticeController);
router.delete("/:id", auth, isAdminOrFaculty, deleteNoticeController);

module.exports = router;
