import React, { useState } from "react";
import UpdatePasswordLoggedIn from "../../components/UpdatePasswordLoggedIn";
import CustomButton from "../../components/CustomButton";

const Profile = ({ profileData }) => {
  const [showUpdatePasswordModal, setShowUpdatePasswordModal] = useState(false);
  if (!profileData) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-7xl mx-auto min-h-[70h] p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12 border-b pb-8">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
          <img
            src={
              profileData?.profile
                ? `${process.env.REACT_APP_MEDIA_LINK}/${profileData.profile}`
                : "/assets/user.avif"
            }
            alt="Profile"
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover ring-4 ring-green-400 ring-offset-4 shadow-md transition-transform hover:scale-105"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
              {`${profileData.firstName} ${profileData.lastName}`}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-1">
              Employee ID: {profileData.employeeId}
            </p>
            <p className="text-base sm:text-lg text-green-600 font-semibold">
              {profileData.designation}
              {profileData.isSuperAdmin && " (Super Admin)"}
            </p>
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <CustomButton
            onClick={() => setShowUpdatePasswordModal(true)}
            className="w-full sm:w-auto"
          >
            Update Password
          </CustomButton>
        </div>

        {showUpdatePasswordModal && (
          <UpdatePasswordLoggedIn
            onClose={() => setShowUpdatePasswordModal(false)}
          />
        )}
      </div>

      {/* Main Grid Sections */}
      <div className="grid grid-cols-1 gap-10">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProfileField label="Email" value={profileData.email} />
            <ProfileField label="Phone" value={profileData.phone} />
            <ProfileField label="Gender" value={profileData.gender} capitalize />
            <ProfileField label="Blood Group" value={profileData.bloodGroup} />
            <ProfileField
              label="Date of Birth"
              value={formatDate(profileData.dob)}
            />
            <ProfileField
              label="Joining Date"
              value={formatDate(profileData.joiningDate)}
            />
            <ProfileField
              label="Salary"
              value={`₹${profileData.salary.toLocaleString()}`}
            />
            <ProfileField
              label="Status"
              value={profileData.status}
              capitalize
            />
            <ProfileField
              label="Role"
              value={profileData.isSuperAdmin ? "Super Admin" : "Admin"}
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200">
            Address Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProfileField label="Address" value={profileData.address} />
            <ProfileField label="City" value={profileData.city} />
            <ProfileField label="State" value={profileData.state} />
            <ProfileField label="Pincode" value={profileData.pincode} />
            <ProfileField label="Country" value={profileData.country} />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200">
            Emergency Contact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProfileField
              label="Name"
              value={profileData.emergencyContact.name}
            />
            <ProfileField
              label="Relationship"
              value={profileData.emergencyContact.relationship}
            />
            <ProfileField
              label="Phone"
              value={profileData.emergencyContact.phone}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Subcomponent for clean design
const ProfileField = ({ label, value, capitalize }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-900 mb-1">{label}</label>
    <p
      className={`text-gray-900 text-base ${capitalize ? "capitalize" : ""
        } break-words`}
    >
      {value || "-"}
    </p>
  </div>
);

export default Profile;
