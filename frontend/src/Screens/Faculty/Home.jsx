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
import {
  FiHome,
  FiBook,
  FiBell,
  FiClipboard,
  FiUserCheck,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Menu Configuration
const MENU_ITEMS = [
  { id: "home", label: "Home", icon: <FiHome className="w-5 h-5" />, component: Profile },
  { id: "timetable", label: "Timetable", icon: <FiClipboard className="w-5 h-5" />, component: Timetable },
  { id: "material", label: "Material", icon: <FiBook className="w-5 h-5" />, component: Material },
  { id: "notice", label: "Notice", icon: <FiBell className="w-5 h-5" />, component: Notice },
  { id: "student", label: "Student Info", icon: <FiUserCheck className="w-5 h-5" />, component: StudentFinder },
  { id: "marks", label: "Marks", icon: <FiClipboard className="w-5 h-5" />, component: Marks },
  { id: "exam", label: "Exam", icon: <FiClipboard className="w-5 h-5" />, component: Exam },
];

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMenu, setSelectedMenu] = useState("home");
  const [profileData, setProfileData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const userToken = localStorage.getItem("userToken");

  // ✅ Fetch Faculty Details
  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      toast.loading("Loading faculty details...", { id: "faculty-profile" });
      const response = await axiosWrapper.get(`/faculty/my-details`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (response.data.success) {
        setProfileData(response.data.data);
        dispatch(setUserData(response.data.data));
        toast.success("Profile loaded!", { id: "faculty-profile" });
      } else {
        toast.error(response.data.message, { id: "faculty-profile" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching profile", { id: "faculty-profile" });
    } finally {
      setIsLoading(false);
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
      flex items-center gap-2 px-5 py-2.5 rounded-2xl font-medium text-sm sm:text-base
      transition-all duration-300 cursor-pointer whitespace-nowrap
      ${isSelected
        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-[1.03]"
        : "bg-white/80 text-gray-700 border border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md"
      }
    `;
  };

  // ✅ Render Page Content
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-8 space-y-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      );
    }

    const MenuItem = MENU_ITEMS.find((item) => item.id === selectedMenu)?.component;

    if (selectedMenu === "home" && profileData) {
      return <Profile profileData={profileData} />;
    }

    return MenuItem ? <MenuItem /> : null;
  };

  const handleMenuClick = (menuId) => {
    setSelectedMenu(menuId);
    navigate(`/faculty?page=${menuId}`);
  };

  return (
    <>
      <Navbar />
      <div className="w-full min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-200">
        <div className="mx-auto">
          {/* 🌟 Sticky Top Menu */}
          <div className="w-full sticky top-[57px] sm:top-[65px] lg:top-[0px] z-30">
            <motion.div
              className="flex justify-start lg:justify-center overflow-x-auto gap-3 py-3 px-3 shadow-md border-b border-gray-100 scrollbar-hide touch-pan-x backdrop-blur-md"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {MENU_ITEMS.map((item) => (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ y: -2 }}
                  className={getMenuItemClass(item.id)}
                  onClick={() => handleMenuClick(item.id)}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </div>

          {/* 🌈 Main Content Section */}
          <AnimatePresence mode="wait">
            <motion.main
              key={selectedMenu}
              className="w-full mx-auto px-3 sm:px-6 md:px-8 py-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              {renderContent()}
            </motion.main>
          </AnimatePresence>
        </div>
      </div>

      <Toaster position="bottom-center" />
    </>
  );
};

export default Home;
