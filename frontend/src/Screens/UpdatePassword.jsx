import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axiosWrapper from "../utils/AxiosWrapper";
import CustomButton from "../components/CustomButton";

const UpdatePassword = () => {
  const navigate = useNavigate();
  const { resetId, type } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!resetId) {
      toast.error("Invalid or expired reset link.");
      navigate("/");
    }
  }, [resetId, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!type) {
      toast.error("Invalid Reset Password Link.");
      return;
    }
    setIsLoading(true);
    toast.loading("Resetting your password...");

    try {
      const response = await axiosWrapper.post(
        `/${type}/update-password/${resetId}`,
        { password: newPassword, resetId }
      );

      toast.dismiss();
      if (response.data.success) {
        toast.success("Password reset successfully.");
        navigate("/");
      } else {
        toast.error(response.data.message || "Error resetting password.");
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error resetting password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-blue-100 px-4">
      <div className="w-full max-w-lg px-8 py-12 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100">
        <h1 className="text-2xl sm:text-4xl font-semibold sm:font-extrabold text-center mb-8">
          🔒 <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500"> Update Password</span>
        </h1>

        <form onSubmit={onSubmit} className="space-y-6 animate-fadeIn">
          {/* New Password */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl 
                     focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500
                     transition duration-200 bg-gray-50 hover:bg-white"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl 
                     focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500
                     transition duration-200 bg-gray-50 hover:bg-white"
            />
          </div>

          {/* Submit Button */}
          <CustomButton
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 flex justify-center items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </CustomButton>
        </form>
      </div>

      <Toaster position="bottom-center" />
    </div>

  );
};

export default UpdatePassword;
