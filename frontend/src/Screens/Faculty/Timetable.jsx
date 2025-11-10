import React, { useEffect, useState } from "react";
import { MdOutlineDelete, MdEdit, MdLink } from "react-icons/md";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import Heading from "../../components/Heading";
import toast from "react-hot-toast";
import axiosWrapper from "../../utils/AxiosWrapper";
import DeleteConfirm from "../../components/DeleteConfirm";
import CustomButton from "../../components/CustomButton";

// ------------------ Add/Edit Timetable Modal ------------------
const AddTimetableModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  branches,
}) => {
  const [formData, setFormData] = useState({
    branch: initialData?.branch?._id || "",
    link: initialData?.link || "",
  });

  // ✅ When editing — auto-fill modal with existing data
  useEffect(() => {
    if (initialData) {
      setFormData({
        branch: initialData?.branch?._id || "",
        link: initialData?.link || "",
      });
    } else {
      setFormData({
        branch: "",
        link: "",
      });
    }
  }, [initialData]);

  const handleSubmit = () => {
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-2">
      <div className="bg-white p-8 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {initialData ? "Edit Timetable" : "Add New Timetable"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-900 hover:text-gray-700"
          >
            <IoMdClose className="text-3xl" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">Batch</label>
            <select
              value={formData.branch}
              onChange={(e) =>
                setFormData({ ...formData, branch: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-md"
            >
              <option value="">Select Branch</option>
              {branches?.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Timetable File Link</label>
            <input
              type="text"
              placeholder="Enter file link (e.g., https://drive.google.com/...)"
              value={formData.link}
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <CustomButton variant="secondary" onClick={onClose}>
              Cancel
            </CustomButton>
            <CustomButton variant="primary" onClick={handleSubmit}>
              {initialData ? "Update" : "Add"}
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

// ------------------ Main Timetable Component ------------------
const Timetable = () => {
  const [branch, setBranch] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedTimetableId, setSelectedTimetableId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState(null);
  const userToken = localStorage.getItem("userToken");

  useEffect(() => {
    getBranchHandler();
    getTimetablesHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------ Fetch Branches ------------------
  const getBranchHandler = async () => {
    try {
      const response = await axiosWrapper.get(`/branch`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (response.data.success) {
        setBranch(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error fetching branches");
    }
  };

  // ------------------ Fetch Timetables ------------------
  const getTimetablesHandler = async () => {
    try {
      const response = await axiosWrapper.get(`/timetable`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (response.data.success) {
        setTimetables(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error fetching timetables");
    }
  };

  // ------------------ Add / Update Timetable ------------------
  const handleSubmitTimetable = async (formData) => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    };

    try {
      toast.loading(editingTimetable ? "Updating Timetable..." : "Adding Timetable...");

      let response;
      if (editingTimetable) {
        response = await axiosWrapper.put(
          `/timetable/${editingTimetable._id}`,
          formData,
          { headers }
        );
      } else {
        response = await axiosWrapper.post("/timetable", formData, { headers });
      }

      toast.dismiss();

      if (response.data.success) {
        toast.success(response.data.message);
        getTimetablesHandler();
        // ✅ Close modal only after successful update
        setShowAddModal(false);
        setEditingTimetable(null);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error saving timetable");
    }
  };

  // ------------------ Delete Timetable ------------------
  const deleteTimetableHandler = async (id) => {
    setIsDeleteConfirmOpen(true);
    setSelectedTimetableId(id);
  };

  const confirmDelete = async () => {
    try {
      toast.loading("Deleting Timetable...");
      const response = await axiosWrapper.delete(
        `/timetable/${selectedTimetableId}`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      toast.dismiss();

      if (response.data.success) {
        toast.success("Timetable deleted successfully");
        setIsDeleteConfirmOpen(false);
        getTimetablesHandler();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error deleting timetable");
    }
  };

  // ------------------ Edit Timetable ------------------
  const editTimetableHandler = (timetable) => {
    setEditingTimetable(timetable);
    setShowAddModal(true);
  };

  return (
    <div className="w-full mx-auto mt-10 flex flex-col justify-center items-start mb-10 relative px-2 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
        <Heading title="Timetable Management" />
        <CustomButton onClick={() => setShowAddModal(true)} className="self-end sm:self-auto">
          <IoMdAdd className="text-2xl" />
        </CustomButton>
      </div>

      {/* Table Section */}
      <div className="mt-8 w-full overflow-x-auto">
        <table className="min-w-full bg-white text-sm border rounded-lg shadow-sm">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="py-3 px-4 sm:py-4 sm:px-6 text-left font-semibold">View</th>
              <th className="py-3 px-4 sm:py-4 sm:px-6 text-left font-semibold">Batch</th>
              <th className="py-3 px-4 sm:py-4 sm:px-6 text-left font-semibold">Created At</th>
              <th className="py-3 px-4 sm:py-4 sm:px-6 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {timetables.map((item, index) => (
              <tr
                key={index}
                className="border-b hover:bg-blue-50 transition-colors duration-150"
              >
                <td className="py-3 px-4 sm:py-4 sm:px-6">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-lg"
                  >
                    <MdLink />
                  </a>
                </td>
                <td className="py-3 px-4 sm:py-4 sm:px-6">{item.branch?.name}</td>
                <td className="py-3 px-4 sm:py-4 sm:px-6">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 sm:py-4 sm:px-6 text-center">
                  <div className="flex justify-center gap-2 sm:gap-4">
                    <CustomButton
                      variant="secondary"
                      onClick={() => editTimetableHandler(item)}
                    >
                      <MdEdit />
                    </CustomButton>
                    <CustomButton
                      variant="danger"
                      onClick={() => deleteTimetableHandler(item._id)}
                    >
                      <MdOutlineDelete />
                    </CustomButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AddTimetableModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingTimetable(null);
        }}
        onSubmit={handleSubmitTimetable}
        initialData={editingTimetable}
        branches={branch}
      />

      <DeleteConfirm
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this timetable?"
      />
    </div>
  );
};

export default Timetable;
