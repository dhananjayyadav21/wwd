import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { MdOutlineDelete, MdEdit } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { AiOutlineClose } from "react-icons/ai";
import Heading from "../../components/Heading";
import DeleteConfirm from "../../components/DeleteConfirm";
import axiosWrapper from "../../utils/AxiosWrapper";
import CustomButton from "../../components/CustomButton";
import { CgDanger } from "react-icons/cg";
import Loading from "../../components/Loading";

const Subject = () => {
  const [data, setData] = useState({
    name: "",
    code: "",
    branch: "",
    semester: "",
    credits: "",
  });
  const [subject, setSubject] = useState([]);
  const [branch, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const userToken = localStorage.getItem("userToken");
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    getSubjectHandler();
    getBranchHandler();
  }, []);

  const getSubjectHandler = async () => {
    try {
      setDataLoading(true);
      const response = await axiosWrapper.get(`/subject`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (response.data.success) setSubject(response.data.data);
      else toast.error(response.data.message);
    } catch (error) {
      if (error.response?.status === 404) setSubject([]);
      else toast.error(error.response?.data?.message || "Error fetching subjects");
    } finally {
      setDataLoading(false);
    }
  };

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

  const addSubjectHandler = async () => {
    if (!data.name || !data.code || !data.branch || !data.credits) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      setDataLoading(true);
      toast.loading(isEditing ? "Updating Subject..." : "Adding Subject...");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      };
      let response;
      if (isEditing) {
        response = await axiosWrapper.patch(`/subject/${selectedSubjectId}`, data, { headers });
      } else {
        response = await axiosWrapper.post(`/subject`, data, { headers });
      }
      toast.dismiss();
      if (response.data.success) {
        toast.success(response.data.message);
        resetForm();
        getSubjectHandler();
      } else toast.error(response.data.message);
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setDataLoading(false);
    }
  };

  const resetForm = () => {
    setData({ name: "", code: "", branch: "", semester: "", credits: "" });
    setShowModal(false);
    setIsEditing(false);
    setSelectedSubjectId(null);
  };

  const deleteSubjectHandler = (id) => {
    setIsDeleteConfirmOpen(true);
    setSelectedSubjectId(id);
  };

  const editSubjectHandler = (subject) => {
    setData({
      name: subject.name,
      code: subject.code,
      branch: subject.branch?._id,
      semester: subject.semester,
      credits: subject.credits,
    });
    setSelectedSubjectId(subject._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      setDataLoading(true);
      toast.loading("Deleting Subject...");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      };
      const response = await axiosWrapper.delete(`/subject/${selectedSubjectId}`, { headers });
      toast.dismiss();
      if (response.data.success) {
        toast.success("Subject deleted successfully");
        setIsDeleteConfirmOpen(false);
        getSubjectHandler();
      } else toast.error(response.data.message);
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error deleting subject");
    } finally {
      setDataLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] md:p-8">
      <div className="max-w-7xl mx-auto px-1">
        <div className="flex justify-between items-center w-full mb-5">
          <Heading title="Subject Details" />
          {branch.length > 0 && (
            <CustomButton onClick={() => setShowModal(true)}>
              <IoMdAdd className="text-2xl" />
            </CustomButton>
          )}
        </div>

        {dataLoading && <Loading />}

        {!dataLoading && branch.length === 0 && (
          <div className="flex flex-col justify-center items-center text-center py-20">
            <CgDanger className="w-16 h-16 text-yellow-500 mb-4" />
            <p className="text-lg font-medium text-gray-600">
              Please add branches before adding subjects.
            </p>
          </div>
        )}

        {!dataLoading && branch.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            {subject.length === 0 ? (
              <div className="text-center py-10 text-gray-900">No subjects found</div>
            ) : (
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100 border-b">
                  <tr className="text-gray-700 text-left text-sm font-semibold">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4">Credits</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subject.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50 transition">
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4">{item.code}</td>
                      <td className="py-3 px-4">{item.branch?.name}</td>
                      <td className="py-3 px-4">{item.credits}</td>
                      <td className="py-3 px-4 flex justify-center gap-3">
                        <button
                          onClick={() => editSubjectHandler(item)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={() => deleteSubjectHandler(item._id)}
                          className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                        >
                          <MdOutlineDelete size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 md:p-8 relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={resetForm}
            >
              <CustomButton onClick={resetForm} variant="secondary">
                <AiOutlineClose size={24} />
              </CustomButton>
            </button>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {isEditing ? "Edit Subject" : "Add Subject"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Subject Name"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />

              <input
                type="text"
                placeholder="Subject Code"
                value={data.code}
                onChange={(e) => setData({ ...data, code: e.target.value })}
                className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />

              <select
                value={data.branch}
                onChange={(e) => setData({ ...data, branch: e.target.value })}
                className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                <option value="">Select Branch</option>
                {branch.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Credits"
                value={data.credits}
                onChange={(e) => setData({ ...data, credits: e.target.value })}
                className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />

              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <CustomButton onClick={resetForm} variant="secondary">
                  Cancel
                </CustomButton>
                <CustomButton
                  onClick={addSubjectHandler}
                  disabled={dataLoading}
                >
                  {isEditing ? "Update Subject" : "Add Subject"}
                </CustomButton>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirm
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this subject?"
      />
    </div>
  );
};

export default Subject;
