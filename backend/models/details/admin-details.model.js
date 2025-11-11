const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const adminDetailsSchema = new mongoose.Schema(
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
    joiningDate: {
      type: Date,
    },
    salary: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

adminDetailsSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

const adminDetails = mongoose.model("AdminDetail", adminDetailsSchema);

module.exports = adminDetails;
