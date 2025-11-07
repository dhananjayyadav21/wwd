const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  aspiring: {
    type: String,
    required: true,
    enum: ["Data Analytics", "ML Engineer", "Software Engineer"],
  },
  examType: {
    type: String,
    required: true,
    enum: ["mid", "end"],
  },
  examLink: {
    type: String,
  },
  totalMarks: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Exam", examSchema);
