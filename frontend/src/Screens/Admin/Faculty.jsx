import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { MdOutlineDelete, MdEdit } from "react-icons/md";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import axiosWrapper from "../../utils/AxiosWrapper";
import Heading from "../../components/Heading";
import DeleteConfirm from "../../components/DeleteConfirm";
import CustomButton from "../../components/CustomButton";
import Loading from "../../components/Loading";

const Faculty = () => {
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profile: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    gender: "",
    dob: "",
    designation: "",
    joiningDate: "",
    salary: "",
    status: "active",
    emergencyContact: { name: "", relationship: "", phone: "" },
    bloodGroup: "",
    branchId: "",
  });

  const [branch, setBranches] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedFacultyId, setSelectedFacultyId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const userToken = localStorage.getItem("userToken");

  // eslint-disable-next-line
  const [file, setFile] = useState(null);
  const [dataLoading, setDataLoading] = useState(null);

  useEffect(() => {
    getFacultyHandler();
    getBranchHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getBranchHandler = async () => {
    try {
      setDataLoading(true);
      const response = await axiosWrapper.get(`/branch`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (response.data.success) setBranches(response.data.data);
      else toast.error(response.data.message);
    } catch (error) {
      if (error.response?.status === 404) setBranches([]);
      else toast.error(error.response?.data?.message || "Error fetching branches");
    } finally {
      setDataLoading(false);
    }
  };

  const getFacultyHandler = async () => {
    try {
      toast.loading("Loading faculty...");
      const response = await axiosWrapper.get(`/faculty`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      toast.dismiss();
      if (response.data.success) {
        toast.dismiss();
        setFaculty(response.data.data);
        toast.success("load faculty !");
      }
      else {
        toast.error(response.data.message);
        toast.dismiss();
      }
    } catch (error) {
      if (error.response?.status === 404) setFaculty([]);
      else toast.error(error.response?.data?.message || "Error fetching faculty");
    } finally {
      console.log("load faculty")
    }
  };

  const addFacultyHandler = async () => {
    try {
      toast.loading(isEditing ? "Updating Faculty" : "Adding Faculty");
      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${userToken}`,
      };

      const formData = new FormData();
      for (const key in data) {
        if (key === "emergencyContact") {
          for (const subKey in data.emergencyContact) {
            formData.append(`emergencyContact[${subKey}]`, data.emergencyContact[subKey]);
          }
        } else formData.append(key, data[key]);
      }
      if (file) formData.append("file", file);

      const response = isEditing
        ? await axiosWrapper.patch(`/faculty/${selectedFacultyId}`, formData, { headers })
        : await axiosWrapper.post(`/faculty/register`, formData, { headers });

      toast.dismiss();
      if (response.data.success) {
        toast.success(isEditing ? "Faculty updated successfully" : "Faculty added successfully (Password: faculty123)");
        resetForm();
        getFacultyHandler();
      } else toast.error(response.data.message);
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error occurred");
    }
  };

  const deleteFacultyHandler = (id) => {
    setIsDeleteConfirmOpen(true);
    setSelectedFacultyId(id);
  };

  const editFacultyHandler = (faculty) => {
    setData({
      firstName: faculty.firstName || "",
      lastName: faculty.lastName || "",
      email: faculty.email || "",
      phone: faculty.phone || "",
      profile: faculty.profile || "",
      address: faculty.address || "",
      city: faculty.city || "",
      state: faculty.state || "",
      pincode: faculty.pincode || "",
      country: faculty.country || "",
      gender: faculty.gender || "",
      dob: faculty.dob?.split("T")[0] || "",
      designation: faculty.designation || "",
      joiningDate: faculty.joiningDate?.split("T")[0] || "",
      salary: faculty.salary || "",
      status: faculty.status || "active",
      emergencyContact: faculty.emergencyContact || { name: "", relationship: "", phone: "" },
      bloodGroup: faculty.bloodGroup || "",
      branchId: faculty.branchId || "",
    });
    setSelectedFacultyId(faculty._id);
    setIsEditing(true);
    setShowAddForm(true);
  };

  const confirmDelete = async () => {
    try {
      toast.loading("Deleting Faculty...");
      const response = await axiosWrapper.delete(`/faculty/${selectedFacultyId}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      toast.dismiss();
      if (response.data.success) {
        toast.success("Faculty deleted successfully");
        setIsDeleteConfirmOpen(false);
        getFacultyHandler();
      } else toast.error(response.data.message);
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error deleting faculty");
    }
  };

  const resetForm = () => {
    setData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      profile: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
      gender: "",
      dob: "",
      designation: "",
      joiningDate: "",
      salary: "",
      status: "active",
      emergencyContact: { name: "", relationship: "", phone: "" },
      bloodGroup: "",
      branchId: "",
    });
    setShowAddForm(false);
    setIsEditing(false);
    setSelectedFacultyId(null);
  };

  const handleInputChange = (field, value) => setData({ ...data, [field]: value });
  const handleEmergencyContactChange = (field, value) =>
    setData({ ...data, emergencyContact: { ...data.emergencyContact, [field]: value } });

  return (
    <div className="w-full mx-auto sm:p-6 md:p-10 sm:rounded-xl sm:shadow-lg space-y-8">
      <div className="flex justify-between items-center w-full mb-6">
        <Heading title="Faculty Management" />
        <button
          onClick={() => (showAddForm ? resetForm() : setShowAddForm(true))}
          className="bg-gray-900 hover:bg-gray-800 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:rotate-90"
        >
          {showAddForm ? <IoMdClose className="text-2xl" /> : <IoMdAdd className="text-2xl" />}
        </button>
      </div>

      {dataLoading && <Loading />}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black/50 z-50 backdrop-blur-sm px-2" style={{ marginBlock: "unset" }}>
          <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-md my-4 p-8 w-[98%] md:w-[80%] lg:w-[60%] max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={resetForm}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-all"
            >
              <IoMdClose className="text-3xl" />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
              {isEditing ? "Edit Faculty" : "Add New Faculty"}
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addFacultyHandler();
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Inputs */}
              {[
                ["First Name", "firstName", true],
                ["Last Name", "lastName", true],
                ["Email", "email", true, "email"],
                ["Phone", "phone", true, "tel"],
                ["Gender", "gender", true],
                ["Batch", "branchId", true],
                ["Address", "address", false],
                ["Designation", "designation", false],
                ["Salary", "salary", false, "number"],
              ].map(([label, field, required, type = "text"]) => (
                <div key={field} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {field === "gender" ? (
                    <select value={data.gender} onChange={(e) => handleInputChange("gender", e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all" required > <option value="">Select Gender</option> {["Male", "Female", "Other"].map((g) => (<option key={g} value={g.toLowerCase()}> {g} </option>))} </select>
                  ) : field === "branchId" ? (
                    <select
                      value={data.branchId}
                      onChange={(e) => handleInputChange("branchId", e.target.value)}
                      required={required}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 transition-all"
                    >
                      <option value="">Select Batch</option>
                      {branch.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={type}
                      value={data[field]}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      required={required}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 transition-all"
                      placeholder={`Enter ${label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}


              {/* Emergency Contact */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mt-4 mb-3 text-gray-800 border-b pb-1">
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["name", "relationship", "phone"].map((f) => (
                    <input
                      key={f}
                      type={f === "phone" ? "tel" : "text"}
                      placeholder={`Enter ${f.charAt(0).toUpperCase() + f.slice(1)}`}
                      value={data.emergencyContact[f]}
                      onChange={(e) => handleEmergencyContactChange(f, e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-3 mt-8">
                <CustomButton
                  variant="secondary"
                  onClick={resetForm}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  variant="primary"
                  type="submit"
                  className="w-full sm:w-auto"
                >
                  {isEditing ? "Update Faculty" : "Add Faculty"}
                </CustomButton>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Faculty List */}
      {!dataLoading && !showAddForm && (
        <div className="w-full overflow-x-auto bg-white rounded-md shadow-md overflow-hidden mt-6">
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-900 to-gray-600 text-white">
              <tr>
                <th className="py-4 px-6 text-left font-semibold">Name</th>
                <th className="py-4 px-6 text-left font-semibold">Email</th>
                <th className="py-4 px-6 text-left font-semibold">Phone</th>
                <th className="py-4 px-6 text-left font-semibold">Designation</th>
                <th className="py-4 px-6 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {faculty.length > 0 ? (
                faculty.map((item, i) => (
                  <tr
                    key={i}
                    className="border-b hover:bg-blue-50 transition-all duration-200"
                  >
                    <td className="py-4 px-6">{`${item.firstName} ${item.lastName}`}</td>
                    <td className="py-4 px-6">{item.email}</td>
                    <td className="py-4 px-6">{item.phone}</td>
                    <td className="py-4 px-6">{item.designation}</td>
                    <td className="py-4 px-6 text-center flex justify-center gap-3">
                      <button
                        onClick={() => editFacultyHandler(item)}
                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-all"
                      >
                        <MdEdit />
                      </button>
                      <button
                        onClick={() => deleteFacultyHandler(item._id)}
                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-all"
                      >
                        <MdOutlineDelete />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-900">
                    No faculty found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <DeleteConfirm
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this faculty?"
      />
    </div>
  );
};

export default Faculty;
