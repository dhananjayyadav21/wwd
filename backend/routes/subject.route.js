const express = require("express");
const {
  getSubjectController,
  addSubjectController,
  deleteSubjectController,
  updateSubjectController,
} = require("../controllers/subject.controller");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");


router.get("/", auth, getSubjectController);
router.post("/", auth, isAdmin, addSubjectController);
router.delete("/:id", auth, isAdmin, deleteSubjectController);
router.put("/:id", auth, isAdmin, updateSubjectController);

module.exports = router;
