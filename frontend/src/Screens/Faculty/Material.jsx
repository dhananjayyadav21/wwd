/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FiUpload, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import Heading from "../../components/Heading";
import { AiOutlineClose } from "react-icons/ai";
import toast from "react-hot-toast";
import axiosWrapper from "../../utils/AxiosWrapper";
import DeleteConfirm from "../../components/DeleteConfirm";
import CustomButton from "../../components/CustomButton";
import { MdLink } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";

const Material = () => {
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [branches, setBranches] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    branch: "",
    type: "notes",
  });
  const [file, setFile] = useState(null);
  const [filters, setFilters] = useState({
    subject: "",
    branch: "",
    type: "",
    fromDate: "",
    toDate: "",
  });
  const [error, setError] = useState(null);

  // --- Logic remains identical ---

  useEffect(() => {
    fetchSubjects();
    fetchBranches();
    fetchMaterials();
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [filters]);

  const fetchSubjects = async () => {
    try {
      toast.loading("Loading subjects...");
      const response = await axiosWrapper.get("/subject", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      if (response.data.success) {
        setSubjects(response.data.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setSubjects([]);
      } else {
        toast.error(
          error?.response?.data?.message || "Failed to load subjects"
        );
      }
    } finally {
      toast.dismiss();
    }
  };

  const fetchBranches = async () => {
    try {
      toast.loading("Loading branches...");
      const response = await axiosWrapper.get("/branch", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      if (response.data.success) {
        setBranches(response.data.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setBranches([]);
      } else {
        toast.error(
          error?.response?.data?.message || "Failed to load branches"
        );
      }
    } finally {
      toast.dismiss();
    }
  };

  const fetchMaterials = async () => {
    try {
      toast.loading("Loading materials...");
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await axiosWrapper.get(`/material?${queryParams}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      if (response.data.success) {
        setMaterials(response.data.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setMaterials([]);
      } else {
        toast.error(
          error?.response?.data?.message || "Failed to load materials"
        );
      }
    } finally {
      toast.dismiss();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subject: "",
      branch: "",
      type: "notes",
    });
    setFile(null);
    setEditingMaterial(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDataLoading(true);
    toast.loading(
      editingMaterial ? "Updating material..." : "Adding material..."
    );

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });
      if (file) {
        formDataToSend.append("file", file);
      }

      if (editingMaterial) {
        await axiosWrapper.put(
          `/material/${editingMaterial._id}`,
          formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        });
        toast.success("Material updated successfully");
      } else {
        await axiosWrapper.post("/material", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        });
        toast.success("Material added successfully");
      }

      setShowModal(false);
      resetForm();
      fetchMaterials();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Operation failed");
    } finally {
      setDataLoading(false);
      toast.dismiss();
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      title: material.title,
      subject: material.subject._id,
      branch: material.branch._id,
      type: material.type,
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await axiosWrapper.delete(`/material/${selectedMaterialId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      toast.success("Material deleted successfully");
      setIsDeleteConfirmOpen(false);
      fetchMaterials();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete material"
      );
    }
  };

  // --- Modified Layout ---

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Header and Add Button */}
      <header className="flex justify-between items-center mb-6 md:mb-8">
        <Heading title="Material Management 📚" />
        <CustomButton onClick={() => {
          setShowModal(true);
          resetForm(); // Ensure form is reset for new material
        }} className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-4 py-2 transition duration-200">
          <IoMdAdd className="text-xl" />
          <span className="hidden sm:inline">Add Material</span>
        </CustomButton>
      </header>

      {/* Filters Section */}
      <section className="bg-white p-4 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FiSearch className="mr-2 text-blue-500" /> Filter Materials
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Subject Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              name="subject"
              value={filters.subject}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch/Branch
            </label>
            <select
              name="branch"
              value={filters.branch}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
            >
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Material Type
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
            >
              <option value="">All Types</option>
              <option value="notes">Notes</option>
              <option value="assignment">Assignment</option>
              <option value="syllabus">Syllabus</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Materials List/Table */}
      <section className="w-full">
        {materials.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md text-gray-500">
            No materials found matching the filters.
          </div>
        ) : (
          <div className="overflow-x-auto hidden lg:block rounded-lg shadow-md">
            {/* Table View for large screens */}
            <table className="min-w-full text-sm">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">Title</th>
                  <th className="py-3 px-4 text-left font-semibold">Subject</th>
                  <th className="py-3 px-4 text-left font-semibold">Batch</th>
                  <th className="py-3 px-4 text-left font-semibold">Type</th>
                  <th className="py-3 px-4 text-left font-semibold">Date</th>
                  <th className="py-3 px-4 text-left font-semibold">File</th>
                  <th className="py-3 px-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {materials.map((material) => (
                  <tr key={material._id} className="hover:bg-blue-50 transition duration-150">
                    <td className="py-4 px-4 font-medium text-gray-900">{material.title}</td>
                    <td className="py-4 px-4 text-gray-700">{material.subject.name}</td>
                    <td className="py-4 px-4 text-gray-700">{material.branch.name}</td>
                    <td className="py-4 px-4 text-gray-700 capitalize">{material.type}</td>
                    <td className="py-4 px-4 text-gray-700 capitalize">{material.date ? new Date(material.date).toISOString().split("T")[0] : "Not Available"}</td>
                    <td className="py-4 px-4">
                      <CustomButton
                        variant="primary"
                        onClick={() => {
                          window.open(
                            `${process.env.REACT_APP_MEDIA_LINK}/${material.file}`
                          );
                        }}
                        className="!p-2 !text-sm flex items-center space-x-1"
                      >
                        <MdLink className="text-lg" />
                        <span className="hidden sm:inline">View</span>
                      </CustomButton>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <CustomButton
                          variant="secondary"
                          onClick={() => handleEdit(material)}
                          className="!p-2 !text-lg"
                        >
                          <FiEdit2 />
                        </CustomButton>
                        <CustomButton
                          variant="danger"
                          onClick={() => {
                            setSelectedMaterialId(material._id);
                            setIsDeleteConfirmOpen(true);
                          }}
                          className="!p-2 !text-lg"
                        >
                          <FiTrash2 />
                        </CustomButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Card View for small/medium screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
          {materials.map((material) => (
            <div key={material._id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition duration-300">
              <h4 className="text-lg font-bold text-blue-600 mb-2">{material.title}</h4>
              <div className="space-y-1 text-sm text-gray-700">
                <p><strong>Subject:</strong> {material.subject.name}</p>
                <p><strong>Batch:</strong> {material.branch.name}</p>
                <p><strong>Type:</strong> <span className="capitalize">{material.type}</span></p>
              </div>
              <div className="mt-4 flex justify-between items-center gap-2">
                <CustomButton
                  variant="primary"
                  onClick={() => {
                    window.open(
                      `${process.env.REACT_APP_MEDIA_LINK}/${material.file}`
                    );
                  }}
                  className="flex items-center space-x-1 !py-2 !px-3"
                >
                  <MdLink className="text-xl" />
                  <span>View File</span>
                </CustomButton>
                <div className="flex gap-2">
                  <CustomButton
                    variant="secondary"
                    onClick={() => handleEdit(material)}
                    className="!p-2"
                  >
                    <FiEdit2 className="text-xl" />
                  </CustomButton>
                  <CustomButton
                    variant="danger"
                    onClick={() => {
                      setSelectedMaterialId(material._id);
                      setIsDeleteConfirmOpen(true);
                    }}
                    className="!p-2"
                  >
                    <FiTrash2 className="text-xl" />
                  </CustomButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add/Edit Material Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingMaterial ? "Edit Material" : "Add New Material"}
              </h2>
              <CustomButton
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                variant="secondary"
                className="!p-2 text-gray-500 hover:text-gray-800"
              >
                <AiOutlineClose size={24} />
              </CustomButton>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter material title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Subject, Branch, Type in a Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Batch */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Batch
                  </label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="notes">Notes</option>
                    <option value="assignment">Assignment</option>
                    <option value="syllabus">Syllabus</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Material File
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-blue-400 text-blue-600 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition duration-150">
                    <FiUpload className="mr-2 text-xl" />
                    <span className="truncate">
                      {file ? file.name : (editingMaterial && !file) ? "Select a new file (optional)" : "Choose File"}
                    </span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      required={!editingMaterial && !file}
                    />
                  </label>
                  {file && (
                    <CustomButton
                      onClick={() => setFile(null)}
                      variant="danger"
                      className="!p-3 !text-lg"
                    >
                      <AiOutlineClose />
                    </CustomButton>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <CustomButton
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  variant="secondary"
                  className="!py-2 !px-4"
                >
                  Cancel
                </CustomButton>
                <CustomButton type="submit" disabled={dataLoading} className="!py-2 !px-4">
                  {dataLoading
                    ? "Processing..."
                    : editingMaterial
                      ? "Update Material"
                      : "Add Material"}
                </CustomButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirm
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this material? This action cannot be undone."
      />
    </div>
  );
};

export default Material;