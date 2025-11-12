import React, { useState, useEffect } from "react";
import { FiLogIn } from "react-icons/fi";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { setUserToken } from "../redux/actions";
import { useDispatch } from "react-redux";
import CustomButton from "../components/CustomButton";
import axiosWrapper from "../utils/AxiosWrapper";
const USER_TYPES = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  ADMIN: "Admin",
};

const LoginForm = ({ selected, onSubmit, formData, setFormData, isLoading }) => (
  <form
    onSubmit={onSubmit}
    className="w-full bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-2xl p-8 transition-all duration-300"
  >
    {/* Email */}
    <div className="mb-6">
      <label
        htmlFor="email"
        className="block text-sm font-semibold text-gray-700 mb-2"
      >
        {selected} Email
      </label>
      <div className="relative">
        <input
          type="email"
          id="email"
          required
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
        />
        <span className="absolute right-3 top-2.5 text-gray-400 text-lg">
          ✉️
        </span>
      </div>
    </div>

    {/* Password */}
    <div className="mb-6">
      <label
        htmlFor="password"
        className="block text-sm font-semibold text-gray-700 mb-2"
      >
        Password
      </label>
      <div className="relative">
        <input
          type="password"
          id="password"
          required
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
        />
        <span className="absolute right-3 top-2.5 text-gray-400 text-lg">
          🔒
        </span>
      </div>
    </div>

    {/* Forgot Password */}
    <div className="flex items-center justify-between mb-6">
      <Link
        to="/forget-password"
        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition-colors duration-200"
      >
        Forgot Password?
      </Link>
    </div>

    {/* Submit Button */}
    <CustomButton
      type="submit"
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 flex justify-center items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        "Logging in..."
      ) : (
        <>
          Login <FiLogIn className="text-lg" />
        </>
      )}
    </CustomButton>
  </form>
);

const UserTypeSelector = ({ selected, onSelect }) => (
  <div className="flex justify-center flex-wrap gap-4 mb-6 md:mb-10">
    {Object.values(USER_TYPES).map((type) => {
      const isSelected = selected === type;
      return (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className={`
          relative px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-full 
          transition-all duration-300 transform
          ${isSelected
              ? "bg-gradient-to-r from-indigo-600 via-blue-300 to-blue-500 text-white shadow-lg scale-105"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-md"
            }
        `}
        >
          {isSelected && (
            <span className="absolute inset-0 rounded-full bg-indigo-500/20 blur-md"></span>
          )}
          <span className="relative z-10">{type}</span>
        </button>
      );
    })}
  </div>

);

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const type = searchParams.get("type");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [selected, setSelected] = useState(USER_TYPES.STUDENT);

  const handleUserTypeSelect = (type) => {
    const userType = type.toLowerCase();
    setSelected(type);
    setSearchParams({ type: userType });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    const toastId = toast.loading("Logging in...");

    try {
      setIsLoading(true);

      const response = await axiosWrapper.post(
        `/${selected.toLowerCase()}/login`,
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        const { token } = response.data.data;

        // Save token & user type
        localStorage.setItem("userToken", token);
        localStorage.setItem("userType", selected);

        dispatch(setUserToken(token));
        navigate(`/${selected.toLowerCase()}`);

        toast.dismiss(toastId);
        toast.success("Login successful!");
      } else {
        toast.dismiss(toastId);
        toast.error(response.data.message || "Login failed");
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
      navigate(`/${localStorage.getItem("userType").toLowerCase()}`);
    }
  }, [navigate]);

  useEffect(() => {
    if (type) {
      const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
      setSelected(capitalizedType);
    }
  }, [type]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-blue-100 px-4 relative overflow-hidden">

      {/* Decorative Gradient Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-indigo-300 rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blue-300 rounded-full blur-3xl opacity-30 animate-pulse"></div>

      <div className="relative w-full max-w-2xl bg-white/70 backdrop-blur-md shadow-xl rounded-3xl px-4 py-8 lg:p-10 border border-gray-200/50 transition-transform duration-300 hover:scale-[1.01]">

        {/* Title */}
        <h1 className="text-2xl lg:text-4xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500 mb-8 drop-shadow-sm">
          {selected} Login
        </h1>

        {/* User Type Selector */}
        <div className="mb-6">
          <UserTypeSelector selected={selected} onSelect={handleUserTypeSelect} />
        </div>

        {/* Login Form */}
        <LoginForm
          selected={selected}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
        />

        {/* Footer Text */}
        <p className="text-center text-sm text-gray-500 mt-8">
          © {new Date().getFullYear()} YourCompany. All rights reserved.
        </p>
      </div>

      {/* Toaster for notifications */}
      <Toaster position="bottom-center" />
    </div>

  );
};

export default Login;
