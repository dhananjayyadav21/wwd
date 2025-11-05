import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { MdOutlineDelete, MdEdit } from "react-icons/md";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import axiosWrapper from "../../utils/AxiosWrapper";
import Heading from "../../components/Heading";
import DeleteConfirm from "../../components/DeleteConfirm";
import CustomButton from "../../components/CustomButton";
import Loading from "../../components/Loading";

const Admin = () => {
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
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
    },
    bloodGroup: "",
  });
  const [admins, setAdmins] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const userToken = localStorage.getItem("userToken");
  const [file, setFile] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    getAdminsHandler();
  }, []);

  const getAdminsHandler = async () => {
    try {
      setDataLoading(true);
      const response = await axiosWrapper.get(`/admin`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (response.data.success) {
        setAdmins(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setAdmins([]);
        return;
      }
      console.error(error);
      toast.error(error.response?.data?.message || "Error fetching admins");
    } finally {
      setDataLoading(false);
    }
  };

  const addAdminHandler = async () => {
    try {
      toast.loading(isEditing ? "Updating Admin" : "Adding Admin");
      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${userToken}`,
      };

      const formData = new FormData();
      for (const key in data) {
        if (key === "emergencyContact") {
          for (const subKey in data.emergencyContact) {
            formData.append(
              `emergencyContact[${subKey}]`,
              data.emergencyContact[subKey]
            );
          }
        } else {
          formData.append(key, data[key]);
        }
      }

      if (file) {
        formData.append("file", file);
      }

      let response;
      if (isEditing) {
        response = await axiosWrapper.patch(
          `/admin/${selectedAdminId}`,
          formData,
          {
            headers,
          }
        );
      } else {
        response = await axiosWrapper.post(`/admin/register`, formData, {
          headers,
        });
      }

      toast.dismiss();
      if (response.data.success) {
        if (!isEditing) {
          toast.success(
            `Admin created successfully! Default password: admin123`
          );
        } else {
          toast.success(response.data.message);
        }
        resetForm();
        getAdminsHandler();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error");
    }
  };

  const deleteAdminHandler = async (id) => {
    setIsDeleteConfirmOpen(true);
    setSelectedAdminId(id);
  };

  const editAdminHandler = (admin) => {
    setData({
      firstName: admin.firstName || "",
      lastName: admin.lastName || "",
      email: admin.email || "",
      phone: admin.phone || "",
      profile: admin.profile || "",
      address: admin.address || "",
      city: admin.city || "",
      state: admin.state || "",
      pincode: admin.pincode || "",
      country: admin.country || "",
      gender: admin.gender || "",
      dob: admin.dob?.split("T")[0] || "",
      designation: admin.designation || "",
      joiningDate: admin.joiningDate?.split("T")[0] || "",
      salary: admin.salary || "",
      status: admin.status || "active",
      emergencyContact: {
        name: admin.emergencyContact?.name || "",
        relationship: admin.emergencyContact?.relationship || "",
        phone: admin.emergencyContact?.phone || "",
      },
      bloodGroup: admin.bloodGroup || "",
    });
    setSelectedAdminId(admin._id);
    setIsEditing(true);
    setShowAddForm(true);
  };

  const confirmDelete = async () => {
    try {
      toast.loading("Deleting Admin");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      };
      const response = await axiosWrapper.delete(`/admin/${selectedAdminId}`, {
        headers,
      });
      toast.dismiss();
      if (response.data.success) {
        toast.success("Admin has been deleted successfully");
        setIsDeleteConfirmOpen(false);
        getAdminsHandler();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error");
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
      emergencyContact: {
        name: "",
        relationship: "",
        phone: "",
      },
      bloodGroup: "",
    });
    setShowAddForm(false);
    setIsEditing(false);
    setSelectedAdminId(null);
  };

  const handleInputChange = (field, value) => {
    setData({ ...data, [field]: value });
  };

  const handleEmergencyContactChange = (field, value) => {
    setData({
      ...data,
      emergencyContact: { ...data.emergencyContact, [field]: value },
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-1 sm:p-6 lg:p-8 mt-4 md:mt-10 mb-10 relative">
      <div className="flex justify-between items-center w-full mb-6">
        <Heading title="Admin Management" />
        <CustomButton
          onClick={() => {
            if (showAddForm) {
              resetForm();
            } else {
              setShowAddForm(true);
            }
          }}
        >
          <IoMdAdd className="text-2xl" />
        </CustomButton>
      </div>

      {/* Add/Edit Form Modal - Highly responsive */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[66vh] overflow-y-auto relative p-6 sm:p-8">
            <button
              onClick={resetForm}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close form"
            >
              <IoMdClose className="text-2xl" />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
              {isEditing ? "Edit Admin" : "Add New Admin"}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addAdminHandler();
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Profile Photo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Profile Photo
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                    accept="image/*"
                  />
                </div>

                {/* Personal Information */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={data.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={data.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={data.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={data.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={data.dob}
                    onChange={(e) => handleInputChange("dob", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={data.bloodGroup}
                    onChange={(e) =>
                      handleInputChange("bloodGroup", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
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

                {/* Job Information */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={data.designation}
                    onChange={(e) =>
                      handleInputChange("designation", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    value={data.joiningDate}
                    onChange={(e) =>
                      handleInputChange("joiningDate", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Salary
                  </label>
                  <input
                    type="number"
                    value={data.salary}
                    onChange={(e) =>
                      handleInputChange("salary", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                </div>

                {/* Address */}
                <div className="lg:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={data.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                </div>

                {/* Location Details */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={data.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={data.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={data.pincode}
                    onChange={(e) =>
                      handleInputChange("pincode", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={data.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                </div>

                {/* Emergency Contact */}
                <div className="sm:col-span-2 lg:col-span-3 mt-4">
                  <h3 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={data.emergencyContact.name}
                        onChange={(e) =>
                          handleEmergencyContactChange("name", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Relationship
                      </label>
                      <input
                        type="text"
                        value={data.emergencyContact.relationship}
                        onChange={(e) =>
                          handleEmergencyContactChange(
                            "relationship",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={data.emergencyContact.phone}
                        onChange={(e) =>
                          handleEmergencyContactChange("phone", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-8 pt-4 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-sm text-gray-600">
                  Default password will be{" "}
                  <span className="font-bold text-gray-600">admin123</span>
                </p>
                <div className="flex gap-4 self-end sm:self-auto">
                  <CustomButton
                    type="button"
                    variant="secondary"
                    onClick={resetForm}
                  >
                    Cancel
                  </CustomButton>
                  <CustomButton type="submit" variant="primary">
                    {isEditing ? "Update Admin" : "Add Admin"}
                  </CustomButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {dataLoading && <Loading />}

      {/* Admin List Table - Responsive implementation */}
      {!dataLoading && !showAddForm && (
        <div className="mt-8 w-full overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full text-sm bg-white border border-gray-200">
            <thead className="bg-gray-900 text-white sticky top-0">
              <tr>
                <th className="py-3 px-4 text-left font-semibold whitespace-nowrap">Name</th>
                <th className="py-3 px-4 text-left font-semibold whitespace-nowrap hidden sm:table-cell">Email</th>
                <th className="py-3 px-4 text-left font-semibold whitespace-nowrap hidden md:table-cell">Phone</th>
                <th className="py-3 px-4 text-left font-semibold whitespace-nowrap hidden lg:table-cell">Employee ID</th>
                <th className="py-3 px-4 text-left font-semibold whitespace-nowrap">Designation</th>
                <th className="py-3 px-4 text-center font-semibold whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins && admins.length > 0 ? (
                admins.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-gray-800">{`${item.firstName} ${item.lastName}`}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-gray-600 hidden sm:table-cell">{item.email}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-gray-600 hidden md:table-cell">{item.phone}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-gray-600 hidden lg:table-cell">{item.employeeId}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-gray-600">{item.designation}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <CustomButton
                          variant="secondary"
                          onClick={() => editAdminHandler(item)}
                          className="p-2 text-lg"
                        >
                          <MdEdit />
                        </CustomButton>
                        <CustomButton
                          variant="danger"
                          onClick={() => deleteAdminHandler(item._id)}
                          className="p-2 text-lg"
                        >
                          <MdOutlineDelete />
                        </CustomButton>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-base py-10 text-gray-500">
                    No Admins found.
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
        message="Are you sure you want to delete this admin?"
      />
    </div>
  );
};

export default Admin;