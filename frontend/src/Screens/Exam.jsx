import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { MdOutlineDelete, MdEdit } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { MdLink } from "react-icons/md";
import { AiOutlineClose } from "react-icons/ai";
import axiosWrapper from "../utils/AxiosWrapper";
import Heading from "../components/Heading";
import DeleteConfirm from "../components/DeleteConfirm";
import CustomButton from "../components/CustomButton";
import { useSelector } from "react-redux";
import Loading from "../components/Loading";

const Exam = () => {
  const [data, setData] = useState({
    name: "",
    date: "",
    examType: "mid",
    aspiring: "",
    examLink: "",
    totalMarks: "",
  });
  const [exams, setExams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // eslint-disable-next-line 
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
      if (error.response?.status === 404) setExams([]);
      else toast.error(error.response?.data?.message || "Error fetching exams");
    } finally {
      setDataLoading(false);
    }
  };

  const addExamHandler = async () => {
    if (!data.name || !data.date || !data.examType || !data.aspiring || !data.totalMarks || !data.examLink) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setProcessLoading(true);
      toast.loading(isEditing ? "Updating Exam..." : "Adding Exam...");

      const response = isEditing
        ? await axiosWrapper.patch(`/exam/${selectedExamId}`, data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        })
        : await axiosWrapper.post("/exam", data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        });

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
      aspiring: "",
      examLink: "",
      totalMarks: "",
    });
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
      aspiring: exam.aspiring,
      examLink: exam.examLink,
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
    <div className="w-full mx-auto sm:p-6 md:p-10 sm:rounded-xl sm:shadow-lg space-y-8">
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
                <th className="py-3 px-4 text-left font-semibold">Aspiring</th>
                <th className="py-3 px-4 text-left font-semibold">Total Marks</th>
                <th className="py-3 px-4 text-left font-semibold">Exam Link</th>
                {loginType !== "Student" && (
                  <th className="py-3 px-4 text-center font-semibold">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {exams?.length > 0 ? (
                exams.map((exam, index) => (
                  <tr key={index} className="border-b hover:bg-blue-50 transition duration-200">
                    <td className="py-3 px-4">{exam.name}</td>
                    <td className="py-3 px-4">{new Date(exam.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 capitalize">
                      {exam.examType === "Surprise" ? "Surprise Test" : "Saturday Test"}
                    </td>
                    <td className="py-3 px-4 capitalize">
                      {exam.aspiring}
                    </td>
                    <td className="py-3 px-4">{exam.totalMarks}</td>
                    <td className="py-3 px-4 text-blue-600 underline">
                      <CustomButton
                        variant="primary"
                        onClick={() =>
                          window.open(
                            `${exam.examLink}`
                          )
                        }
                      >
                        <MdLink className="text-xl" />
                      </CustomButton>
                    </td>
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
                    colSpan={loginType !== "Student" ? 6 : 5}
                    className="text-center py-6 text-gray-900"
                  >
                    No exams found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black/50 z-50 backdrop-blur-sm px-2" style={{ marginBlock: "unset" }}>
          <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-md my-4 p-8 w-[98%] md:w-[80%] lg:w-[60%] max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                {isEditing ? "Edit Exam" : "Add New Exam"}
              </h2>
              <CustomButton onClick={resetForm} variant="secondary" className="!p-2">
                <AiOutlineClose size={22} />
              </CustomButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={data.date}
                  onChange={(e) => setData({ ...data, date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                <input
                  type="number"
                  value={data.totalMarks}
                  onChange={(e) => setData({ ...data, totalMarks: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Career Aspiring</label>
                <select
                  value={data.aspiring}
                  onChange={(e) => setData({ ...data, aspiring: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-gray-900 outline-none"
                >
                  <option value="">Select One</option>
                  <option value="Data Analytics">Data Analytics</option>
                  <option value="ML Engineer">ML Engineer</option>
                  <option value="Software Engineer">Software Engineer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                <select
                  value={data.examType}
                  onChange={(e) => setData({ ...data, examType: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-gray-900 outline-none"
                >
                  <option value="Surprise">Surprise Test</option>
                  <option value="Saturday">Saturday Test</option>
                </select>
              </div>


              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Link (URL)
                </label>
                <input
                  type="url"
                  value={data.examLink}
                  onChange={(e) => setData({ ...data, examLink: e.target.value })}
                  placeholder="https://example.com/exam-link"
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-gray-900 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <CustomButton onClick={resetForm} variant="secondary">
                Cancel
              </CustomButton>
              <CustomButton onClick={addExamHandler} disabled={processLoading}>
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
