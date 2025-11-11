import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { toast, Toaster } from "react-hot-toast";
import Notice from "../Notice";
import Timetable from "./Timetable";
import Material from "./Material";
import Profile from "./Profile";
import Exam from "../Exam";
import ViewMarks from "./ViewMarks";
import { useDispatch } from "react-redux";
import { setUserData } from "../../redux/actions";
import axiosWrapper from "../../utils/AxiosWrapper";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiHome,
  FiBookOpen,
  FiBell,
  FiFileText,
  FiAward,
  FiCalendar,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const MENU_ITEMS = [
  { id: "home", label: "Dashboard", icon: <FiHome className="w-5 h-5" />, component: Profile },
  { id: "timetable", label: "Timetable", icon: <FiCalendar className="w-5 h-5" />, component: Timetable },
  { id: "material", label: "Study Material", icon: <FiBookOpen className="w-5 h-5" />, component: Material },
  { id: "notice", label: "Notices", icon: <FiBell className="w-5 h-5" />, component: Notice },
  { id: "exam", label: "Examinations", icon: <FiFileText className="w-5 h-5" />, component: Exam },
  { id: "marks", label: "My Marks", icon: <FiAward className="w-5 h-5" />, component: ViewMarks },
];

const Home = () => {
  const [selectedMenu, setSelectedMenu] = useState("home");
  const [profileData, setProfileData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const userToken = localStorage.getItem("userToken");
  const location = useLocation();
  const navigate = useNavigate();

  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      toast.loading("Loading profile...", { id: "profile-load" });
      const response = await axiosWrapper.get("/student/my-details", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (response.data.success) {
        setProfileData(response.data.data);
        dispatch(setUserData(response.data.data));
        toast.success("Profile loaded!", { id: "profile-load" });
      } else {
        toast.error(response.data.message, { id: "profile-load" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching profile", { id: "profile-load" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
    // eslint-disable-next-line
  }, [dispatch, userToken]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const pathMenuId = urlParams.get("page") || "home";
    const validMenu = MENU_ITEMS.find((item) => item.id === pathMenuId);
    setSelectedMenu(validMenu ? validMenu.id : "home");
    // eslint-disable-next-line
  }, [location.pathname]);

  const getMenuItemClass = (menuId) => {
    const isSelected = selectedMenu === menuId;
    return `
      flex items-center gap-2 px-5 py-2.5 rounded-2xl font-medium text-sm sm:text-base
      transition-all duration-300 cursor-pointer whitespace-nowrap
      ${isSelected
        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-[1.03]"
        : "bg-white/90 text-gray-700 border border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md"
      }
    `;
  };

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

    if (selectedMenu === "home" && profileData) {
      return <Profile profileData={profileData} />;
    }

    const MenuItem = MENU_ITEMS.find((item) => item.id === selectedMenu)?.component;
    return MenuItem ? <MenuItem /> : null;
  };

  const handleMenuClick = (menuId) => {
    setSelectedMenu(menuId);
    navigate(`/student?page=${menuId}`);
  };

  return (
    <>
      <Navbar />
      <div className="w-full min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-300">
        <div className="mx-auto">
          {/* 🌟 Sticky Navigation Bar */}
          <div className="w-full sticky top-[57px] sm:top-[65px] z-30">
            <motion.div
              className="flex justify-center overflow-x-auto gap-3 py-3 px-3  bg-white/40 backdrop-blur-md shadow-lg border border-gray-100 scrollbar-hide"
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

          {/* 🌟 Main Content */}
          <AnimatePresence mode="wait">
            <motion.main
              key={selectedMenu}
              className="w-max-7xl px-2 py-8 backdrop-blur-md "
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
