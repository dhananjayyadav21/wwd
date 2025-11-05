import React, { useState } from "react";
import axiosWrapper from "../utils/AxiosWrapper";
import { toast } from "react-hot-toast";


const UpdatePasswordLoggedIn = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // NOTE: In a single file context, we use standard 'fetch' API instead of a custom 'axiosWrapper'.
  const userToken = localStorage.getItem("userToken");
  const userType = localStorage.getItem("userType");

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    // Safety check for user context
    if (!userType || !userToken) {
      toast.error("Authentication context is missing.");
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = `/api/${userType.toLowerCase()}/change-password`;

      // const response = await fetch(apiUrl, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${userToken}`,
      //   },
      //   body: JSON.stringify({
      //     currentPassword,
      //     newPassword,
      //   }),
      // });

      const response = await axiosWrapper.post(
        `/${userType.toLowerCase()}/change-password`,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      const data = response.data

      if (data.success) {
        toast.success("Password updated successfully");
        // Clear fields on success
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onClose(); // Close the modal on success
      } else {
        // Handle server-side errors or non-200 responses
        toast.error(data.message || "Failed to update password. Check current password.");
      }
    } catch (error) {
      // Handle network errors
      console.error("Password update error:", error);
      toast.error("A network error occurred or the API is unavailable.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Outer Overlay: Fixed position, dark semi-transparent background, full screen
    <div className="fixed inset-0 min-h-full z-50 flex items-start justify-center p-2 backdrop-blur-sm bg-black/40">

      {/* Modal Container: Modern Card Styling with responsiveness */}
      <div className="relative w-full max-w-md mx-auto bg-white rounded-xl shadow-2xl p-6 sm:p-8 transition-all duration-300 transform scale-100 opacity-100">

        {/* Header and Close Button */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Update Password</h2>

          {/* Close Button: Replaced IoMdClose with Inline SVG to fix the import error */}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 transition duration-150 p-1 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
          >
            {/* Inline SVG for Close Icon (IoMdClose replacement) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handlePasswordUpdate}>
          {/* Form Input Group */}
          <div className="space-y-4">

            {/* Current Password Field */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                // Black/White Focus Ring
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition duration-150"
                required
              />
            </div>

            {/* New Password Field */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                New Password (min 8 characters)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                // Black/White Focus Ring
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition duration-150"
                required
              />
            </div>

            {/* Confirm New Password Field */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                // Black/White Focus Ring
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition duration-150"
                required
              />
            </div>
          </div>

          {/* Submit Button: Enhanced styling for a professional black/white look */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full flex items-center justify-center bg-gray-900 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:bg-gray-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01]"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default UpdatePasswordLoggedIn;