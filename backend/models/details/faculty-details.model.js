const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const facultyDetailsSchema = new mongoose.Schema(
  {
    employeeId: {
      type: Number,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    profile: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    pincode: {
      type: String,
    },
    country: {
      type: String,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },
    dob: {
      type: Date,
    },
    designation: {
      type: String,
    },
    salary: {
      type: Number,
    },
    isFaculty: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    // bloodGroup: {
    //   type: String,
    //   enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    // },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

facultyDetailsSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

const facultyDetails = mongoose.model("FacultyDetail", facultyDetailsSchema);

module.exports = facultyDetails;
