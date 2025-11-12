const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer.middleware");
const auth = require("../middlewares/auth.middleware");
const isAdminOrFaculty = require("../middlewares/isAdminOrFaculty.middleware");

const {
  getMaterialsController,
  addMaterialController,
  updateMaterialController,
  deleteMaterialController,
} = require("../controllers/material.controller");

router.get("/", auth, getMaterialsController);
router.post("/", auth, isAdminOrFaculty, upload.single("file"), addMaterialController);
router.put("/:id", auth, isAdminOrFaculty, upload.single("file"), updateMaterialController);
router.delete("/:id", auth, isAdminOrFaculty, deleteMaterialController);

module.exports = router;
