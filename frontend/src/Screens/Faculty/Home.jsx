import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { toast, Toaster } from "react-hot-toast";
import Notice from "../Notice";
import Timetable from "./Timetable";
import Material from "./Material";
import StudentFinder from "./StudentFinder";
import Profile from "./Profile";
import Marks from "./AddMarks";
import Exam from "../Exam";
import { useDispatch } from "react-redux";
import { setUserData } from "../../redux/actions";
import axiosWrapper from "../../utils/AxiosWrapper";
import { useNavigate, useLocation } from "react-router-dom";

// ✅ Feather Icons
import { FiHome, FiBook, FiBell, FiClipboard, FiUserCheck } from "react-icons/fi";

// ✅ Menu Configuration
const MENU_ITEMS = [
  { id: "home", label: "Home", icon: <FiHome />, component: Profile },
  { id: "timetable", label: "Timetable", icon: <FiClipboard />, component: Timetable },
  { id: "material", label: "Material", icon: <FiBook />, component: Material },
  { id: "notice", label: "Notice", icon: <FiBell />, component: Notice },
  { id: "student", label: "Student Info", icon: <FiUserCheck />, component: StudentFinder },
  { id: "marks", label: "Marks", icon: <FiUserCheck />, component: Marks },
  { id: "exam", label: "Exam", icon: <FiClipboard />, component: Exam },
];

const Home = () => {
  const [selectedMenu, setSelectedMenu] = useState("home");
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const userToken = localStorage.getItem("userToken");
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Fetch Faculty Details
  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      toast.loading("Loading profile...");
      const response = await axiosWrapper.get("/faculty/my-details", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (response.data.success) {
        setProfileData(response.data.data);
        dispatch(setUserData(response.data.data));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
      toast.dismiss();
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [dispatch, userToken]);

  // ✅ Handle URL Query Parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const pathMenuId = urlParams.get("page") || "home";
    const validMenu = MENU_ITEMS.find((item) => item.id === pathMenuId);
    setSelectedMenu(validMenu ? validMenu.id : "home");
  }, [location.pathname]);

  // ✅ Menu Item Styling
  const getMenuItemClass = (menuId) => {
    const isSelected = selectedMenu === menuId;
    return `
      flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm sm:text-base
      transition-all duration-300 cursor-pointer
      ${isSelected
        ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-md scale-105"
        : "bg-white/40 text-gray-700 backdrop-blur-md border border-gray-200 hover:bg-white/60 hover:text-blue-700"
      }
    `;
  };

  // ✅ Render Content
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64 text-gray-600">
          Loading...
        </div>
      );
    }

    if (selectedMenu === "home" && profileData) {
      return <Profile profileData={profileData} />;
    }

    const MenuItem = MENU_ITEMS.find((item) => item.id === selectedMenu)?.component;
    return MenuItem && <MenuItem />;
  };

  const handleMenuClick = (menuId) => {
    setSelectedMenu(menuId);
    navigate(`/faculty?page=${menuId}`);
  };

  return (
    <>
      <Navbar />

      <div className="w-full mx-auto p-2">
        {/* ✅ Modern Scrollable Top Menu */}
        <div className="flex overflow-x-auto sm:overflow-visible gap-3 sm:gap-5 py-4 sm:py-6 scrollbar-hide justify-start sm:justify-center sticky top-16 z-20">
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
        <div className="bg-white/70 backdrop-blur-lg md:rounded-2xl md:shadow-lg sm:p-4 md:p-8 mt-4 sm:mt-6 min-h-[70vh] transition-all">
          {renderContent()}
        </div>
      </div>

      <Toaster position="bottom-center" />
    </>
  );
};

export default Home;
