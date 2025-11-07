import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { MdOutlineDelete, MdEdit } from "react-icons/md";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import Heading from "../../components/Heading";
import DeleteConfirm from "../../components/DeleteConfirm";
import axiosWrapper from "../../utils/AxiosWrapper";
import CustomButton from "../../components/CustomButton";
import NoData from "../../components/NoData";
import { CgDanger } from "react-icons/cg";

const Student = () => {
  const [searchParams, setSearchParams] = useState({
    enrollmentNo: "",
    name: "",
    branch: "",
  });
  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const userToken = localStorage.getItem("userToken");

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    email: "",
    branchId: "",
    gender: "",
    dob: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    profile: "",
    status: "active",
    bloodGroup: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
    },
  });

  useEffect(() => {
    getBranchHandler();
  }, []);

  const getBranchHandler = async () => {
    try {
      toast.loading("Loading branches...");
      const response = await axiosWrapper.get(`/branch`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (response.data.success) {
        setBranches(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setBranches([]);
      } else {
        console.error(error);
        toast.error(error.response?.data?.message || "Error fetching branches");
      }
    } finally {
      toast.dismiss();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const searchStudents = async (e) => {
    e.preventDefault();

    if (
      !searchParams.enrollmentNo &&
      !searchParams.name &&
      !searchParams.branch
    ) {
      toast.error("Please select at least one filter");
      return;
    }

    setDataLoading(true);
    setHasSearched(true);
    toast.loading("Searching students...");
    try {
      const response = await axiosWrapper.post(
        `/student/search`,
        searchParams,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      toast.dismiss();
      if (response.data.success) {
        if (response.data.data.length === 0) {
          setStudents([]);
        } else {
          toast.success("Students found!");
          setStudents(response.data.data);
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      setStudents([]);
      toast.error(error.response?.data?.message || "Error searching students");
    } finally {
      setDataLoading(false);
    }
  };

  const handleFormInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEmergencyContactChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value,
      },
    }));
  };

  const addStudentHandler = async () => {
    try {
      toast.loading(isEditing ? "Updating Student" : "Adding Student");
      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${userToken}`,
      };

      const formDataToSend = new FormData();
      for (const key in formData) {
        if (key === "emergencyContact") {
          for (const subKey in formData.emergencyContact) {
            formDataToSend.append(
              `emergencyContact[${subKey}]`,
              formData.emergencyContact[subKey]
            );
          }
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }

      if (file) {
        formDataToSend.append("file", file);
      }

      let response;
      if (isEditing) {
        response = await axiosWrapper.patch(
          `/student/${selectedStudentId}`,
          formDataToSend,
          {
            headers,
          }
        );
      } else {
        response = await axiosWrapper.post(
          `/student/register`,
          formDataToSend,
          {
            headers,
          }
        );
      }

      toast.dismiss();
      if (response.data.success) {
        if (!isEditing) {
          toast.success(
            `Student created successfully! Default password: student123`
          );
        } else {
          toast.success(response.data.message);
        }
        resetForm();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error");
    }
  };

  const deleteStudentHandler = (id) => {
    setIsDeleteConfirmOpen(true);
    setSelectedStudentId(id);
  };

  const editStudentHandler = (student) => {
    setFormData({
      firstName: student.firstName || "",
      middleName: student.middleName || "",
      lastName: student.lastName || "",
      phone: student.phone || "",
      email: student.email || "",
      branchId: student.branchId?._id || "",
      gender: student.gender || "",
      dob: student.dob?.split("T")[0] || "",
      address: student.address || "",
      city: student.city || "",
      state: student.state || "",
      pincode: student.pincode || "",
      country: student.country || "",
      profile: student.profile || "",
      status: student.status || "active",
      bloodGroup: student.bloodGroup || "",
      emergencyContact: {
        name: student.emergencyContact?.name || "",
        relationship: student.emergencyContact?.relationship || "",
        phone: student.emergencyContact?.phone || "",
      },
    });
    setSelectedStudentId(student._id);
    setIsEditing(true);
    setShowAddForm(true);
  };

  const confirmDelete = async () => {
    try {
      toast.loading("Deleting Student");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      };
      const response = await axiosWrapper.delete(
        `/student/${selectedStudentId}`,
        {
          headers,
        }
      );
      toast.dismiss();
      if (response.data.success) {
        toast.success("Student has been deleted successfully");
        setIsDeleteConfirmOpen(false);
        searchStudents({ preventDefault: () => { } });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error");
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      phone: "",
      email: "",
      branchId: "",
      gender: "",
      dob: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
      profile: "",
      status: "active",
      bloodGroup: "",
      emergencyContact: {
        name: "",
        relationship: "",
        phone: "",
      },
    });
    setShowAddForm(false);
    setIsEditing(false);
    setSelectedStudentId(null);
    setFile(null);
  };

  // --- Start of JSX with Modern and Responsive Styles ---
  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header and Add Button */}
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <Heading title="Student Management" />
        {branches.length > 0 && (
          <CustomButton
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition duration-200"
          >
            <IoMdAdd className="text-xl" />
            <span className="hidden sm:inline">Add Student</span>
          </CustomButton>
        )}
      </div>

      {/* Warning/Info Section */}
      {branches.length === 0 && (
        <div className="flex justify-center items-center flex-col w-full mt-16 p-8 bg-yellow-50 border border-yellow-300 rounded-xl shadow-md">
          <CgDanger className="w-12 h-12 text-yellow-500 mb-4" />
          <p className="text-center text-lg font-medium text-yellow-800">
            Please **add batches** before adding a student.
          </p>
        </div>
      )}

      {/* Search Form Section */}
      {branches.length > 0 && (
        <div className="my-8 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Search Students
          </h2>
          <form onSubmit={searchStudents}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Enrollment Number Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enrollment Number
                </label>
                <input
                  type="text"
                  name="enrollmentNo"
                  value={searchParams.enrollmentNo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition duration-150"
                  placeholder="Enter enrollment number"
                />
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={searchParams.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition duration-150"
                  placeholder="Enter student name"
                />
              </div>

              {/* Batch Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch
                </label>
                <select
                  name="branch"
                  value={searchParams.branch}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition duration-150 bg-white"
                >
                  <option value="">Select Batch</option>
                  {branches?.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Button (responsive alignment) */}
              <div className="flex items-end pt-2 sm:pt-0">
                <CustomButton
                  type="submit"
                  disabled={dataLoading}
                  variant="primary"
                  className="w-full py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200"
                >
                  {dataLoading ? "Searching..." : "Search"}
                </CustomButton>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Search Instructions */}
      {!hasSearched && branches.length > 0 && (
        <div className="text-center mt-12 text-gray-900 flex flex-col items-center justify-center p-10 bg-gray-50 rounded-xl shadow-inner mx-auto max-w-lg">

          <p className="mt-4 text-base">
            Please use the filters above to search for students.
          </p>
        </div>
      )}

      {/* No Data Found */}
      {hasSearched && students.length === 0 && (
        <div className="mt-8">
          <NoData title="No students found matching your criteria." />
        </div>
      )}

      {/* Search Results Table */}
      {students && students.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Search Results ({students.length})
          </h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Profile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    E. No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Batch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider hidden sm:table-cell">
                    Email
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-blue-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={`${process.env.REACT_APP_MEDIA_LINK}/${student.profile}`}
                        alt={`${student.firstName}'s profile`}
                        className="w-10 h-10 object-cover rounded-full ring-2 ring-blue-400"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1744315900478-fa44dc6a4e89?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.firstName} {student.middleName} {student.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.enrollmentNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.branchId?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hidden sm:table-cell">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center space-x-2">
                        <CustomButton
                          variant="secondary"
                          className="!p-2.5 text-blue-600 hover:bg-blue-100 rounded-full transition duration-150"
                          onClick={() => editStudentHandler(student)}
                          title="Edit Student"
                        >
                          <MdEdit className="text-lg" />
                        </CustomButton>
                        <CustomButton
                          variant="danger"
                          className="!p-2.5 text-red-600 hover:bg-red-100 rounded-full transition duration-150"
                          onClick={() => deleteStudentHandler(student._id)}
                          title="Delete Student"
                        >
                          <MdOutlineDelete className="text-lg" />
                        </CustomButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Student Modal Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg md:rounded-xl shadow-2xl w-full max-w-4xl max-h-[100vh] md:max-h-[70vh] overflow-y-auto relative transform transition-all duration-300 scale-100 opacity-100">
            {/* Close Button */}
            <button
              onClick={resetForm}
              className="absolute top-4 right-4 text-gray-900 hover:text-red-600 p-2 rounded-full bg-gray-100 hover:bg-red-50 transition-colors shadow-md"
            >
              <IoMdClose className="text-2xl" />
            </button>
            {/* Modal Content */}
            <div className="p-8 sm:p-10">
              <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-3">
                {isEditing ? "Edit Student Details" : "Register New Student"}
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addStudentHandler();
                }}
              >
                {/* Form Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Basic Details */}
                  {/* Repeated input fields with modern styling */}
                  {Object.keys(formData)
                    .filter(
                      (key) =>
                        key !== "emergencyContact" &&
                        key !== "profile" &&
                        key !== "status" &&
                        key !== "branchId" &&
                        key !== "gender" &&
                        key !== "bloodGroup"
                    )
                    .map((key) => {
                      // Custom labels for better readability
                      const labelMap = {
                        firstName: "First Name",
                        middleName: "Middle Name",
                        lastName: "Last Name",
                        phone: "Phone Number",
                        email: "Email Address",
                        dob: "Date of Birth",
                        address: "Address",
                        city: "City",
                        state: "State",
                        pincode: "Pincode",
                        country: "Country",
                      };

                      // Custom types for better input experience
                      const typeMap = {
                        phone: "tel",
                        email: "email",
                        dob: "date",
                        pincode: "text", // using text for flexibility with different formats
                      };

                      // Address takes full width
                      const isFullWidth = key === "address";

                      return (
                        <div key={key} className={isFullWidth ? "lg:col-span-3" : "col-span-1"}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1)}
                          </label>
                          <input
                            type={typeMap[key] || "text"}
                            value={formData[key]}
                            onChange={(e) =>
                              handleFormInputChange(key, e.target.value)
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition duration-150"
                            placeholder={`Enter ${labelMap[key] || key}`}
                            required={!["middleName", "profile"].includes(key)}
                          />
                        </div>
                      );
                    })}

                  {/* Branch Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Batch
                    </label>
                    <select
                      value={formData.branchId}
                      onChange={(e) =>
                        handleFormInputChange("branchId", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition duration-150 bg-white"
                      required
                    >
                      <option value="">Select Batch</option>
                      {branches?.map((branch) => (
                        <option key={branch._id} value={branch._id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Gender Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        handleFormInputChange("gender", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition duration-150 bg-white"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Blood Group Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Group
                    </label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) =>
                        handleFormInputChange("bloodGroup", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition duration-150 bg-white"
                      required
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  {/* Profile Photo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profile Photo
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition duration-150 border border-gray-300 rounded-lg shadow-sm"
                      accept="image/*"
                    />
                  </div>

                  {/* Emergency Contact Section */}
                  <div className="lg:col-span-3 pt-4 border-t mt-4 border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">
                      Emergency Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {["name", "relationship", "phone"].map((key) => {
                        const labelMap = {
                          name: "Contact Name",
                          relationship: "Relationship",
                          phone: "Contact Phone",
                        };
                        return (
                          <div key={`emergency-${key}`}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {labelMap[key]}
                            </label>
                            <input
                              type={key === "phone" ? "tel" : "text"}
                              value={formData.emergencyContact[key]}
                              onChange={(e) =>
                                handleEmergencyContactChange(key, e.target.value)
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition duration-150"
                              placeholder={`Enter ${labelMap[key]}`}
                              required
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer/Action Area */}
                <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                  {/* Default Login Info */}
                  <div className="text-sm text-gray-600 order-2 sm:order-1 text-center sm:text-left">
                    <p>
                      Default password:{" "}
                      <span className="font-bold text-blue-600">student123</span>
                    </p>
                  </div>
                  {/* Buttons */}
                  <div className="flex gap-4 order-1 sm:order-2">
                    <CustomButton
                      type="button"
                      variant="secondary"
                      onClick={resetForm}
                      className="py-2 px-4 rounded-lg hover:bg-gray-200 transition duration-200"
                    >
                      Cancel
                    </CustomButton>
                    <CustomButton
                      type="submit"
                      variant="primary"
                      className="py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-200"
                    >
                      {isEditing ? "Update Student" : "Add Student"}
                    </CustomButton>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - No Style Change Needed */}
      <DeleteConfirm
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this student?"
      />
    </div>
  );
};

export default Student;