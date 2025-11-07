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
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 ">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-12 border-b pb-6 justify-between">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={
              profileData?.profile
                ? `${process.env.REACT_APP_MEDIA_LINK}/${profileData.profile}`
                : "/assets/user.avif"
            }
            alt="Profile"
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover ring-4 ring-yellow-600 ring-offset-2"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1">
              {`${profileData.firstName} ${profileData.middleName} ${profileData.lastName}`}
            </h1>
            <p className="text-sm sm:text-lg text-gray-600 mb-1">
              Enrollment No: {profileData.enrollmentNo}
            </p>
            <p className="text-sm sm:text-lg text-yellow-600 font-medium">
              {profileData.branchId.name}
            </p>
          </div>
        </div>

        <div className="mt-4 lg:mt-0">
          <CustomButton
            onClick={() => setShowPasswordUpdate(!showPasswordUpdate)}
            variant="primary"
          >
            {showPasswordUpdate ? "Hide" : "Update Password"}
          </CustomButton>
        </div>
      </div>

      {showPasswordUpdate && (
        <UpdatePasswordLoggedIn onClose={() => setShowPasswordUpdate(false)} />
      )}

      {/* Info Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
            Personal Information
          </h2>
          <div className="space-y-3">
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
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
            Address Information
          </h2>
          <div className="space-y-3">
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
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
            Emergency Contact
          </h2>
          <div className="space-y-3">
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
