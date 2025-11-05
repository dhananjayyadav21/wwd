import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { MdOutlineDelete, MdEdit } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { AiOutlineClose } from "react-icons/ai";
import axiosWrapper from "../utils/AxiosWrapper";
import Heading from "../components/Heading";
import DeleteConfirm from "../components/DeleteConfirm";
import CustomButton from "../components/CustomButton";
import { FiUpload } from "react-icons/fi";
import { useSelector } from "react-redux";
import Loading from "../components/Loading";

const Exam = () => {
  const [data, setData] = useState({
    name: "",
    date: "",
    examType: "mid",
    timetableLink: "",
    totalMarks: "",
  });
  const [exams, setExams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState(null);
  const userData = useSelector((state) => state.userData);
  const loginType = localStorage.getItem("userType");
  const [processLoading, setProcessLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    getExamsHandler();
  }, []);

  const getExamsHandler = async () => {
    try {
      setDataLoading(true);
      const response = await axiosWrapper.get("/exam", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      if (response.data.success) {
        setExams(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setExams([]);
      } else {
        toast.error(error.response?.data?.message || "Error fetching exams");
      }
    } finally {
      setDataLoading(false);
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const addExamHandler = async () => {
    if (!data.name || !data.date || !data.examType || !data.totalMarks) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      setProcessLoading(true);
      toast.loading(isEditing ? "Updating Exam..." : "Adding Exam...");
      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      };
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("date", data.date);
      formData.append("examType", data.examType);
      formData.append("totalMarks", data.totalMarks);
      if (file) formData.append("file", file);

      const response = isEditing
        ? await axiosWrapper.patch(`/exam/${selectedExamId}`, formData, { headers })
        : await axiosWrapper.post("/exam", formData, { headers });

      toast.dismiss();
      if (response.data.success) {
        toast.success(response.data.message);
        resetForm();
        getExamsHandler();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error saving exam");
    } finally {
      setProcessLoading(false);
    }
  };

  const resetForm = () => {
    setData({
      name: "",
      date: "",
      examType: "mid",
      timetableLink: "",
      totalMarks: "",
    });
    setFile(null);
    setShowModal(false);
    setIsEditing(false);
    setSelectedExamId(null);
  };

  const deleteExamHandler = (id) => {
    setIsDeleteConfirmOpen(true);
    setSelectedExamId(id);
  };

  const editExamHandler = (exam) => {
    setData({
      name: exam.name,
      date: new Date(exam.date).toISOString().split("T")[0],
      examType: exam.examType,
      timetableLink: exam.timetableLink,
      totalMarks: exam.totalMarks,
    });
    setSelectedExamId(exam._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      toast.loading("Deleting Exam...");
      const response = await axiosWrapper.delete(`/exam/${selectedExamId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      toast.dismiss();
      if (response.data.success) {
        toast.success("Exam deleted successfully");
        setIsDeleteConfirmOpen(false);
        getExamsHandler();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="w-full mx-auto mt-10 flex flex-col mb-10 px-1 sm:px-6 lg:px-8">
      <div className="flex flex-row justify-between items-center w-full gap-4">
        <Heading title="Exam Details" />
        {loginType !== "Student" && (
          <CustomButton onClick={() => setShowModal(true)}>
            <IoMdAdd className="text-2xl" />
          </CustomButton>
        )}
      </div>

      {dataLoading ? (
        <Loading />
      ) : (
        <div className="mt-8 w-full overflow-x-auto bg-white shadow rounded-md">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-black text-white">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">Exam Name</th>
                <th className="py-3 px-4 text-left font-semibold">Date</th>
                <th className="py-3 px-4 text-left font-semibold">Type</th>
                <th className="py-3 px-4 text-left font-semibold">Total Marks</th>
                {loginType !== "Student" && (
                  <th className="py-3 px-4 text-center font-semibold">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {exams?.length > 0 ? (
                exams.map((exam, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-blue-50 transition duration-200"
                  >
                    <td className="py-3 px-4">{exam.name}</td>
                    <td className="py-3 px-4">
                      {new Date(exam.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 capitalize">
                      {exam.examType === "mid" ? "Mid Term" : "End Term"}
                    </td>
                    <td className="py-3 px-4">{exam.totalMarks}</td>
                    {loginType !== "Student" && (
                      <td className="py-3 px-4 text-center flex justify-center gap-3">
                        <CustomButton
                          variant="secondary"
                          className="!p-2"
                          onClick={() => editExamHandler(exam)}
                        >
                          <MdEdit />
                        </CustomButton>
                        <CustomButton
                          variant="danger"
                          className="!p-2"
                          onClick={() => deleteExamHandler(exam._id)}
                        >
                          <MdOutlineDelete />
                        </CustomButton>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={loginType !== "Student" ? 5 : 4}
                    className="text-center py-6 text-gray-500"
                  >
                    No exams found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Exam Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg sm:max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                {isEditing ? "Edit Exam" : "Add New Exam"}
              </h2>
              <CustomButton
                onClick={resetForm}
                variant="secondary"
                className="!p-2"
              >
                <AiOutlineClose size={22} />
              </CustomButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Name
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={data.date}
                  onChange={(e) => setData({ ...data, date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Type
                </label>
                <select
                  value={data.examType}
                  onChange={(e) => setData({ ...data, examType: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="mid">Mid Term</option>
                  <option value="end">End Term</option>
                </select>
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Marks
                </label>
                <input
                  type="number"
                  value={data.totalMarks}
                  onChange={(e) =>
                    setData({ ...data, totalMarks: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timetable File
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex-1 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50 flex items-center justify-center">
                    <FiUpload className="mr-2" />
                    {file ? file.name : "Choose File"}
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      required={!isEditing}
                    />
                  </label>
                  {file && (
                    <CustomButton
                      onClick={() => setFile(null)}
                      variant="danger"
                      className="!p-2"
                    >
                      <AiOutlineClose size={20} />
                    </CustomButton>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <CustomButton onClick={resetForm} variant="secondary">
                Cancel
              </CustomButton>
              <CustomButton
                onClick={addExamHandler}
                disabled={processLoading}
              >
                {isEditing ? "Update Exam" : "Add Exam"}
              </CustomButton>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirm
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this exam?"
      />
    </div>
  );
};

export default Exam;
