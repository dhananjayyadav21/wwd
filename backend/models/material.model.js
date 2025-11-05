const mongoose = require("mongoose");

const Material = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacultyDetail",
      required: true,
    },
    file: {
      type: String,
      required: true,
    },
    semester: {
      type: Number,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    type: {
      type: String,
      enum: ["notes", "assignment", "syllabus", "other"],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Material", Material);
