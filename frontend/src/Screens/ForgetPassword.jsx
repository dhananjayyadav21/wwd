import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axiosWrapper from "../utils/AxiosWrapper";
import CustomButton from "../components/CustomButton";

const USER_TYPES = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  ADMIN: "Admin",
};

const UserTypeSelector = ({ selected, onSelect }) => (
  <div className="flex justify-center gap-4 mb-8">
    {Object.values(USER_TYPES).map((type) => (
      <button
        key={type}
        onClick={() => onSelect(type)}
        className={`px-5 py-2 text-sm font-medium rounded-full transition duration-200 ${selected === type
          ? "bg-gradient-to-r from-indigo-600 via-blue-300 to-blue-500 text-white shadow-lg scale-105"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-md"
          }`}
      >
        {type}
      </button>
    ))}
  </div>
);

const ForgetPassword = () => {
  const navigate = useNavigate();
  const userToken = localStorage.getItem("userToken");
  const [selected, setSelected] = useState(USER_TYPES.STUDENT);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (userToken) {
      navigate(`/${localStorage.getItem("userType")}`);
    }
  }, [userToken, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    toast.loading("Sending reset mail...");
    if (email === "") {
      toast.dismiss();
      toast.error("Please enter your email");
      return;
    }
    try {
      const headers = {
        "Content-Type": "application/json",
      };
      const resp = await axiosWrapper.post(
        `/${selected.toLowerCase()}/forget-password`,
        { email },
        {
          headers: headers,
        }
      );

      if (resp.data.success) {
        toast.dismiss();
        toast.success(resp.data.message);
      } else {
        toast.dismiss();
        toast.error(resp.data.message);
      }
    } catch (error) {
      toast.dismiss();
      console.error(error);
      toast.error(error.response?.data?.message || "Error sending reset mail");
    } finally {
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-blue-100 px-4 py-10">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.1)]">

        {/* Heading */}
        <h1 className="text-2xl sm:text-4xl font-semibold sm:font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500 text-center mb-8 tracking-tight">
          {selected} <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500">Forgot Password</span>
        </h1>

        {/* User Type Selector */}
        <div className="mb-6">
          <UserTypeSelector selected={selected} onSelect={setSelected} />
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {selected} Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email address"
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                     transition-all"
            />
          </div>

          {/* Button */}
          <CustomButton
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 flex justify-center items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            Send Reset Link
          </CustomButton>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <a
              href="/"
              className="text-blue-500 font-medium hover:underline"
            >
              Login here
            </a>
          </p>
        </div>
      </div>

      <Toaster position="bottom-center" />
    </div>
  );
};

export default ForgetPassword;
