import React, { useState } from "react";
import CustomButton from "../../components/CustomButton";
import UpdatePasswordLoggedIn from "../../components/UpdatePasswordLoggedIn";

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
    <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 md:gap-8 mb-8 border-b pb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
          <img
            src={
              profileData?.profile
                ? `${process.env.REACT_APP_MEDIA_LINK}/${profileData.profile}`
                : "/assets/user.avif"
            }
            alt="Profile"
            className="w-32 sm:w-40 h-32 sm:h-40 rounded-full object-cover ring-4 ring-purple-900 ring-offset-2"
          />
          <div className="text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1">
              {`${profileData.firstName} ${profileData.lastName}`}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-1">
              Employee ID: {profileData.employeeId}
            </p>
            <p className="text-sm sm:text-lg text-purple-600 font-medium">
              {profileData.designation}
            </p>
          </div>
        </div>
        <div>
          <CustomButton
            onClick={() => setShowPasswordUpdate(!showPasswordUpdate)}
            variant="primary"
          >
            {showPasswordUpdate ? "Hide" : "Update Password"}
          </CustomButton>
        </div>
        {showPasswordUpdate && (
          <UpdatePasswordLoggedIn onClose={() => setShowPasswordUpdate(false)} />
        )}
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-6">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 transition-all hover:shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 pb-1 border-b border-gray-200">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label className="text-sm font-medium text-gray-900">Email</label>
              <p className="text-gray-900">{profileData.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">Phone</label>
              <p className="text-gray-900">{profileData.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">Gender</label>
              <p className="text-gray-900 capitalize">{profileData.gender}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">Blood Group</label>
              <p className="text-gray-900">{profileData.bloodGroup}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">Date of Birth</label>
              <p className="text-gray-900">{formatDate(profileData.dob)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">Joining Date</label>
              <p className="text-gray-900">{formatDate(profileData.joiningDate)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">Salary</label>
              <p className="text-gray-900">₹{profileData.salary.toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">Status</label>
              <p className="text-gray-900 capitalize">{profileData.status}</p>
            </div>
          </div>
        </div>

        {/* Address Info */}
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 transition-all hover:shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 pb-1 border-b border-gray-200">
            Address Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label className="text-sm font-medium text-gray-900">Address</label>
              <p className="text-gray-900">{profileData.address}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">City</label>
              <p className="text-gray-900">{profileData.city}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">State</label>
              <p className="text-gray-900">{profileData.state}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">Pincode</label>
              <p className="text-gray-900">{profileData.pincode}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">Country</label>
              <p className="text-gray-900">{profileData.country}</p>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 transition-all hover:shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 pb-1 border-b border-gray-200">
            Emergency Contact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label className="text-sm font-medium text-gray-900">Name</label>
              <p className="text-gray-900">{profileData.emergencyContact.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">Relationship</label>
              <p className="text-gray-900">{profileData.emergencyContact.relationship}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">Phone</label>
              <p className="text-gray-900">{profileData.emergencyContact.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
