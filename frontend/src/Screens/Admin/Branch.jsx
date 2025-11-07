import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { MdOutlineDelete, MdEdit } from "react-icons/md";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import axiosWrapper from "../../utils/AxiosWrapper";
import Heading from "../../components/Heading";
import DeleteConfirm from "../../components/DeleteConfirm";
import CustomButton from "../../components/CustomButton";
import Loading from "../../components/Loading";

const Branch = () => {
  const [data, setData] = useState({ name: "", branchId: "" });
  const [branch, setBranch] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    getBranchHandler();
  }, []);

  // ✅ Fetch Branch Data
  const getBranchHandler = async () => {
    setDataLoading(true);
    try {
      const response = await axiosWrapper.get(`/branch`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      if (response.data.success) {
        setBranch(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setBranch([]);
      } else {
        toast.error(error.response?.data?.message || "Error fetching branches");
      }
    } finally {
      setDataLoading(false);
    }
  };

  // ✅ Add or Update Branch
  const addBranchHandler = async (e) => {
    e.preventDefault();
    if (!data.name || !data.branchId) {
      toast.error("Please fill all the fields");
      return;
    }
    try {
      toast.loading(isEditing ? "Updating Batch..." : "Adding Batch...");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      };

      const response = isEditing
        ? await axiosWrapper.patch(`/branch/${selectedBranchId}`, data, {
          headers,
        })
        : await axiosWrapper.post(`/branch`, data, { headers });

      toast.dismiss();
      if (response.data.success) {
        toast.success(response.data.message);
        setShowAddForm(false);
        setData({ name: "", branchId: "" });
        setIsEditing(false);
        setSelectedBranchId(null);
        getBranchHandler();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error saving batch");
    }
  };

  // ✅ Delete Branch
  const deleteBranchHandler = (id) => {
    setSelectedBranchId(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      toast.loading("Deleting Batch...");
      const response = await axiosWrapper.delete(`/branch/${selectedBranchId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      toast.dismiss();
      if (response.data.success) {
        toast.success("Batch deleted successfully!");
        setIsDeleteConfirmOpen(false);
        getBranchHandler();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error deleting batch");
    }
  };

  // ✅ Edit Branch
  const editBranchHandler = (branch) => {
    setData({ name: branch.name, branchId: branch.branchId });
    setSelectedBranchId(branch._id);
    setIsEditing(true);
    setShowAddForm(true);
  };

  return (
    <div className="w-full mx-auto mt-10 flex flex-col items-start mb-10 sm:px-8 p-2">
      <Heading title="Batch Management" />

      {/* Floating Add Button */}
      <CustomButton
        onClick={() => {
          setShowAddForm(!showAddForm);
          if (!showAddForm) {
            setData({ name: "", branchId: "" });
            setIsEditing(false);
            setSelectedBranchId(null);
          }
        }}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-500 hover:to-gray-600 text-white shadow-lg !rounded-full !p-4 transition-transform transform hover:scale-105"
      >
        {showAddForm ? <IoMdClose className="text-3xl" /> : <IoMdAdd className="text-3xl" />}
      </CustomButton>

      {/* Loading Spinner */}
      {dataLoading && <Loading />}

      {/* Add / Edit Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-3">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl w-full max-w-lg shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {isEditing ? "Edit Batch" : "Add New Batch"}
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-red-500 transition"
              >
                <IoMdClose className="text-2xl" />
              </button>
            </div>

            <form onSubmit={addBranchHandler} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Name
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  placeholder="e.g. Batch 1"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch ID
                </label>
                <input
                  type="text"
                  value={data.branchId}
                  onChange={(e) => setData({ ...data, branchId: e.target.value })}
                  placeholder="e.g. 001"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <CustomButton
                  variant="secondary"
                  onClick={() => setShowAddForm(false)}
                  className="!px-6 !py-2"
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  variant="primary"
                  type="submit"
                  className="!px-6 !py-2"
                >
                  {isEditing ? "Update" : "Add"}
                </CustomButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branch List Table */}
      {!dataLoading && (
        <div className="mt-8 w-full overflow-x-auto bg-white/80 backdrop-blur-md rounded-md shadow-lg">
          <table className="min-w-full text-sm text-gray-700">
            <thead>
              <tr className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                <th className="py-4 px-6 text-left font-semibold">Batch Name</th>
                <th className="py-4 px-6 text-left font-semibold">Batch ID</th>
                <th className="py-4 px-6 text-left font-semibold">Created At</th>
                <th className="py-4 px-6 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {branch && branch.length > 0 ? (
                branch.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-6">{item.name}</td>
                    <td className="py-3 px-6">{item.branchId}</td>
                    <td className="py-3 px-6">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-6 text-center flex justify-center gap-3">
                      <button
                        onClick={() => editBranchHandler(item)}
                        className="p-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full shadow-sm transition"
                      >
                        <MdEdit size={18} />
                      </button>
                      <button
                        onClick={() => deleteBranchHandler(item._id)}
                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-full shadow-sm transition"
                      >
                        <MdOutlineDelete size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center text-gray-600 py-8 text-base"
                  >
                    No batches found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation */}
      <DeleteConfirm
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this Batch?"
      />
    </div>
  );
};

export default Branch;
