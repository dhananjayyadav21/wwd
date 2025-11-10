import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { toast, Toaster } from "react-hot-toast";
import Notice from "../Notice";
import Student from "./Student";
import Faculty from "./Faculty";
import Subjects from "./Subject";
import Admin from "./Admin";
import Branch from "./Branch";
import { useDispatch } from "react-redux";
import { setUserData } from "../../redux/actions";
import axiosWrapper from "../../utils/AxiosWrapper";
import Profile from "./Profile";
import Exam from "../Exam";
import Dashboard from "../Dashboard";
import { useNavigate, useLocation } from "react-router-dom";

// ✅ Feather Icons
import {
  FiHome,
  FiUsers,
  FiBook,
  FiBell,
  FiUserCheck,
  FiClipboard,
  FiUser,
  FiLayers,
} from "react-icons/fi";

// ✅ Menu Configuration
const MENU_ITEMS = [
  { id: "home", label: "Home", icon: <FiHome />, component: Profile },
  { id: "student", label: "Student", icon: <FiUsers />, component: Student },
  { id: "faculty", label: "Faculty", icon: <FiUserCheck />, component: Faculty },
  { id: "branch", label: "Batch", icon: <FiLayers />, component: Branch },
  { id: "notice", label: "Notice", icon: <FiBell />, component: Notice },
  { id: "exam", label: "Exam", icon: <FiClipboard />, component: Exam },
  { id: "subjects", label: "Subjects", icon: <FiBook />, component: Subjects },
  { id: "admin", label: "Admin", icon: <FiUser />, component: Admin },
  { id: "dashboard", label: "Dashboard", icon: <FiClipboard />, component: Dashboard },
];

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMenu, setSelectedMenu] = useState("home");
  const [profileData, setProfileData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const userToken = localStorage.getItem("userToken");

  // ✅ Fetch User Details
  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      toast.loading("Loading user details...");
      const response = await axiosWrapper.get(`/admin/my-details`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (response.data.success) {
        setProfileData(response.data.data);
        dispatch(setUserData(response.data.data));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Error fetching user details"
      );
    } finally {
      setIsLoading(false);
      toast.dismiss();
    }
  };

  useEffect(() => {
    fetchUserDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, userToken]);

  // ✅ Handle URL Query Parameter for Navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const pathMenuId = urlParams.get("page") || "home";
    const validMenu = MENU_ITEMS.find((item) => item.id === pathMenuId);
    setSelectedMenu(validMenu ? validMenu.id : "home");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // ✅ Menu Item Styling
  const getMenuItemClass = (menuId) => {
    const isSelected = selectedMenu === menuId;
    return `
      flex items-center justify-center gap-2
      px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl
      font-medium text-sm sm:text-base transition-all duration-300
      ${isSelected
        ? "bg-gradient-to-r from-gray-900 to-indigo-600 text-white shadow-md scale-105"
        : "bg-white/40 text-gray-700 backdrop-blur-md border border-gray-200 hover:bg-white/60 hover:text-blue-700"
      }
    `;
  };

  // ✅ Render Page Content
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64 text-gray-600">
          Loading...
        </div>
      );
    }

    const MenuItem = MENU_ITEMS.find(
      (item) => item.id === selectedMenu
    )?.component;

    if (selectedMenu === "home" && profileData) {
      return <Profile profileData={profileData} />;
    }

    return MenuItem && <MenuItem />;
  };

  const handleMenuClick = (menuId) => {
    setSelectedMenu(menuId);
    navigate(`/admin?page=${menuId}`);
  };

  return (
    <>
      <Navbar />

      <div className="w-full mx-auto bg-white">
        {/* ✅ Modern Scrollable Top Menu */}
        <div
          className="
            flex overflow-x-auto sm:overflow-visible
            gap-3 sm:gap-5 py-4 px-1 sm:py-6
            scrollbar-hide justify-start sm:justify-center
            sticky top-14 z-20 bg-white
          "
        >
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              className={getMenuItemClass(item.id)}
              onClick={() => handleMenuClick(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* ✅ Main Content Area */}
        <div
          className="
            bg-white/70 backdrop-blur-lg
            sm:p-4 md:p-8 
            min-h-[90vh] transition-all
          "
        >
          {renderContent()}
        </div>
      </div>

      <Toaster position="bottom-center" />
    </>
  );
};

export default Home;
