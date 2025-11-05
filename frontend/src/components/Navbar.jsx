import React from "react";
import { FiLogOut } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import CustomButton from "./CustomButton";

const Navbar = () => {
  const router = useLocation();
  const navigate = useNavigate();

  const logouthandler = () => {
    // Storing keys in a constant is generally a good practice
    const tokenKey = "userToken";
    const typeKey = "userType";

    localStorage.removeItem(tokenKey);
    localStorage.removeItem(typeKey);
    navigate("/");
  };

  // Determine the Dashboard title
  const dashboardTitle = router.state?.type || "User"; // Fallback to 'User' if type is not present

  return (
    // **Modern Styling:** Soft shadow, slightly rounded, clean background
    <nav className="bg-white shadow-lg sticky top-0 z-10 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Flex container for content, using 'flex-wrap' for small screens */}
        <div className="flex justify-between items-center gap-4 flex-wrap">

          {/* Dashboard Title / Logo */}
          <div
            className="flex items-center text-xl sm:text-2xl font-bold text-gray-800 cursor-pointer transition duration-300 hover:text-gray-600"
            onClick={() => navigate("/")}
          >
            {/* Icon Styling: Brighter color, consistent size */}
            <span className="mr-2 text-indigo-500">
              <RxDashboard className="w-6 h-6" />
            </span>
            {/* Title text styling */}
            {dashboardTitle} Dashboard
          </div>

          {/* Logout Button */}
          <div>
            <CustomButton
              // Assuming CustomButton handles variants and full responsiveness
              variant="danger"
              onClick={logouthandler}
              // Added a small professional touch with a light hover effect on the button wrapper
              className="group"
            >
              <span className="text-sm sm:text-base">Logout</span>
              {/* Icon Styling: Added margin, ensuring consistent icon size */}
              <span className="ml-2">
                <FiLogOut className="w-5 h-5" />
              </span>
            </CustomButton>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;