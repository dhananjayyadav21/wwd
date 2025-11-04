const adminDetails = require("./models/details/admin-details.model");
const connectToMongo = require("./database/db");
const mongoose = require("mongoose");

const seedData = async () => {
  try {
    await connectToMongo();

    // Clear existing admin data
    await adminDetails.deleteMany({});

    const password = "admin.dhananjay@iit";
    const employeeId = 123456;

    const adminDetail = {
      employeeId: employeeId,
      firstName: "Dhananjay",
      middleName: "S",
      lastName: "Yadav",
      email: "admindhananjay@gmail.com",
      phone: "9769565004",
      profile: "Faculty_Profile_123456.jpg",
      address: "Thane",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400605",
      country: "India",
      gender: "male",
      dob: new Date("2004-07-18"),
      designation: "System Administrator",
      joiningDate: new Date(),
      salary: 50000,
      status: "active",
      isSuperAdmin: true,
      emergencyContact: {
        name: "Emergency Contact",
        relationship: "Brother",
        phone: "9769565004",
      },
      bloodGroup: "O+",
      password: password,
    };

    await adminDetails.create(adminDetail);

    console.log("\n=== Admin Credentials ===");
    console.log("Employee ID:", employeeId);
    console.log("Password:", password);
    console.log("Email:", adminDetail.email);
    console.log("=======================\n");
    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error while seeding:", error);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
};

seedData();
