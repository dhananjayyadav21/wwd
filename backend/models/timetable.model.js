const mongoose = require("mongoose");

const TimeTable = new mongoose.Schema(
  {
    link: {
      type: String,
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    semester: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Timetable", TimeTable);
