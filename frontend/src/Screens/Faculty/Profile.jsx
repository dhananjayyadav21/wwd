import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CustomButton from "../../components/CustomButton";
import UpdatePasswordLoggedIn from "../../components/UpdatePasswordLoggedIn";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiUser,
  FiCalendar,
  FiLock,
  FiBriefcase,
  FiHeart,
} from "react-icons/fi";

const Profile = ({ profileData }) => {
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  if (!profileData) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* 🌟 Header Section */}
      <motion.div
        className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 lg:gap-12 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-white rounded-3xl p-8 shadow-lg"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={
              profileData?.profile
                ? `${process.env.REACT_APP_MEDIA_LINK}/${profileData.profile}`
                : "/assets/user.avif"
            }
            alt="Profile"
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold mb-1">
              {`${profileData.firstName} ${profileData.lastName}`}
            </h1>
            <p className="text-sm sm:text-lg text-gray-100 mb-1">
              Employee ID: {profileData.employeeId}
            </p>
            <p className="text-base sm:text-lg font-semibold text-red-800">
              {profileData.designation}
            </p>
          </div>
        </div>

        <div className="mt-4 lg:mt-0">
          <CustomButton
            onClick={() => setShowPasswordUpdate(!showPasswordUpdate)}
            variant="primary"
            className="bg-white/20 text-white hover:bg-white/30 font-semibold rounded-xl shadow-md transition-transform transform hover:scale-[1.03]"
          >
            <FiLock className="inline-block mr-2" />
            {showPasswordUpdate ? "Hide" : "Update Password"}
          </CustomButton>
        </div>
      </motion.div>

      {/* 🔐 Password Update Section */}
      <AnimatePresence>
        {showPasswordUpdate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <UpdatePasswordLoggedIn onClose={() => setShowPasswordUpdate(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📋 Info Sections */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* 🧍 Personal Information */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center gap-2 border-b pb-2">
            <FiUser className="text-indigo-600" /> Personal Information
          </h2>
          <div className="space-y-4 text-gray-700">
            <div className="flex items-center gap-2">
              <FiMail className="text-indigo-500" />
              <span>{profileData.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiPhone className="text-indigo-500" />
              <span>{profileData.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiUser className="text-indigo-500" />
              <span className="capitalize">{profileData.gender}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiHeart className="text-indigo-500" />
              <span>{profileData.bloodGroup}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCalendar className="text-indigo-500" />
              <span>{formatDate(profileData.dob)}</span>
            </div>
          </div>
        </div>

        {/* 💼 Job Information */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center gap-2 border-b pb-2">
            <FiBriefcase className="text-indigo-600" /> Job Information
          </h2>
          <div className="space-y-3 text-gray-700">
            <p><strong>Designation:</strong> {profileData.designation}</p>
            <p><strong>Joining Date:</strong> {formatDate(profileData.joiningDate)}</p>
            <p><strong>Salary:</strong> ₹{profileData.salary.toLocaleString()}</p>
            <p><strong>Status:</strong> {profileData.status}</p>
          </div>
        </div>

        {/* 📍 Address Information */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center gap-2 border-b pb-2">
            <FiMapPin className="text-indigo-600" /> Address Information
          </h2>
          <div className="space-y-3 text-gray-700">
            <p><strong>Address:</strong> {profileData.address}</p>
            <p><strong>City:</strong> {profileData.city}</p>
            <p><strong>State:</strong> {profileData.state}</p>
            <p><strong>Pincode:</strong> {profileData.pincode}</p>
            <p><strong>Country:</strong> {profileData.country}</p>
          </div>
        </div>

        {/* 🚨 Emergency Contact */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 p-6 md:col-span-2 lg:col-span-3">
          <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center gap-2 border-b pb-2">
            <FiPhone className="text-indigo-600" /> Emergency Contact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-700">
            <p><strong>Name:</strong> {profileData.emergencyContact.name}</p>
            <p><strong>Relationship:</strong> {profileData.emergencyContact.relationship}</p>
            <p><strong>Phone:</strong> {profileData.emergencyContact.phone}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
