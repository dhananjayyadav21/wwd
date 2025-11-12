const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");
const {
  getBranchController,
  addBranchController,
  updateBranchController,
  deleteBranchController,
} = require("../controllers/branch.controller");

router.get("/", auth, getBranchController);
router.post("/", auth, isAdmin, addBranchController);
router.patch("/:id", auth, isAdmin, updateBranchController);
router.delete("/:id", auth, isAdmin, deleteBranchController);

module.exports = router;
