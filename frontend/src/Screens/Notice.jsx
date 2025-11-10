import React, { useEffect, useState } from "react";
import { IoMdLink, IoMdAdd, IoMdClose } from "react-icons/io";
import { HiOutlineCalendar } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import { MdDeleteOutline, MdEditNote } from "react-icons/md";
import toast from "react-hot-toast";
import Heading from "../components/Heading";
import axiosWrapper from "../utils/AxiosWrapper";
import CustomButton from "../components/CustomButton";
import DeleteConfirm from "../components/DeleteConfirm";
import Loading from "../components/Loading";

// --- Helper component for Professional Notice Type Badge ---
const ProfessionalTypeBadge = ({ type }) => {
  let colorClass = "bg-gray-100 text-gray-700";
  let label = "General";

  if (type === "student") {
    colorClass = "bg-blue-50 text-blue-700 border border-blue-200";
    label = "STUDENT";
  } else if (type === "faculty") {
    colorClass = "bg-teal-50 text-teal-700 border border-teal-200";
    label = "FACULTY";
  } else if (type === "both") {
    colorClass = "bg-gray-200 text-gray-800 border border-gray-300";
    label = "ALL AUDIENCE";
  }

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded uppercase tracking-widest ${colorClass}`}>
      {label}
    </span>
  );
};

const Notice = () => {
  const router = useLocation();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedNoticeId, setSelectedNoticeId] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const token = localStorage.getItem("userToken");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "student",
    link: "",
  });

  useEffect(() => {
    if (!token) {
      toast.error("Please login to continue");
      navigate("/login");
    }
  }, [token, navigate]);

  const getNotices = async () => {
    try {
      setDataLoading(true);
      const response = await axiosWrapper.get("/notice", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setNotices(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setNotices([]);
      } else {
        toast.error(error.response?.data?.message || "Failed to load notices");
      }
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    getNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]);

  const openAddModal = () => {
    setEditingNotice(null);
    setFormData({
      title: "",
      description: "",
      type: "student",
      link: "",
    });
    setShowAddModal(true);
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title || "",
      description: notice.description || "",
      type: notice.type || "student",
      link: notice.link || "",
    });
    setShowAddModal(true);
  };

  const handleSubmitNotice = async (e) => {
    e.preventDefault();
    const { title, description, type } = formData;

    if (!title || !description || !type) {
      toast.dismiss();
      toast.error("Please fill all the fields");
      return;
    }

    try {
      toast.loading(editingNotice ? "Updating Notice" : "Adding Notice", { id: 'notice-submit' });

      const response = await axiosWrapper[editingNotice ? "put" : "post"](
        `/notice${editingNotice ? `/${editingNotice._id}` : ""}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.dismiss('notice-submit');
      if (response.data.success) {
        toast.success(response.data.message);
        getNotices();
        setShowAddModal(false);
        setEditingNotice(null);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss('notice-submit');
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async () => {
    try {
      toast.loading("Deleting Notice", { id: 'notice-delete' });
      const response = await axiosWrapper.delete(
        `/notice/${selectedNoticeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.dismiss('notice-delete');
      if (response.data.success) {
        toast.success("Notice deleted successfully");
        setIsDeleteConfirmOpen(false);
        getNotices();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss('notice-delete');
      toast.error(error.response?.data?.message || "Failed to delete notice");
    }
  };

  const isAdminOrFaculty = router.pathname === "/faculty" || router.pathname === "/admin";

  return (
    <div className="w-full mx-auto p-4 md:p-10 bg-white rounded-xl shadow-lg">
      {/* --- Header Section --- */}
      <div className="flex justify-between items-center pb-6 border-b border-gray-100 mb-8">
        <Heading title="Official Announcements & Notices" />
        {!dataLoading && isAdminOrFaculty && (
          <CustomButton onClick={openAddModal} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg transition duration-200 shadow-md hover:shadow-lg">
            <IoMdAdd className="text-xl" />
            <span>Post New Notice</span>
          </CustomButton>
        )}
      </div>

      {/* --- Loading State --- */}
      {dataLoading && <Loading />}

      {/* --- Notices List/Grid --- */}
      {!dataLoading && (
        <div className="mt-8">
          {notices.length === 0 ? (
            <div className="text-center py-20 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-xl text-gray-500 font-medium">
                No official notices available at this time.
              </p>
            </div>
          ) : (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {notices?.map((notice) => (
                <div
                  key={notice._id}
                  className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between h-full"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      {/* Notice Title */}
                      <h3
                        className={`text-lg font-bold text-gray-900 line-clamp-2 transition duration-300 flex items-start group ${notice.link
                          ? "cursor-pointer hover:text-blue-600"
                          : ""
                          }`}
                        onClick={() => notice.link && window.open(notice.link, "_blank")}
                      >
                        {notice.title}
                        {notice.link && (
                          <IoMdLink className="ml-2 flex-shrink-0 text-xl text-blue-500 group-hover:text-blue-700 transition duration-300" title="External Document Link" />
                        )}
                      </h3>
                      {/* Admin/Faculty Actions */}
                      {isAdminOrFaculty && (
                        <div className="flex gap-1 ml-4 flex-shrink-0">
                          <CustomButton
                            onClick={() => handleEdit(notice)}
                            variant="icon"
                            className="text-gray-500 hover:text-blue-600 !p-2 rounded-lg transition duration-150"
                            title="Edit Notice"
                          >
                            <MdEditNote size={20} />
                          </CustomButton>
                          <CustomButton
                            onClick={() => {
                              setSelectedNoticeId(notice._id);
                              setIsDeleteConfirmOpen(true);
                            }}
                            variant="icon"
                            className="text-gray-500 hover:text-red-600 !p-2 rounded-lg transition duration-150"
                            title="Delete Notice"
                          >
                            <MdDeleteOutline size={20} />
                          </CustomButton>
                        </div>
                      )}
                    </div>

                    {/* Notice Description */}
                    <p className="text-gray-600 text-sm line-clamp-3 mb-5 leading-snug">
                      {notice.description}
                    </p>
                  </div>

                  {/* Footer/Meta Info */}
                  <div className="p-6 pt-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100">
                    <div className="flex items-center font-medium text-gray-700">
                      <HiOutlineCalendar className="mr-1 text-base text-gray-500" />
                      {new Date(notice.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <ProfessionalTypeBadge type={notice.type} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- Professional Modal UI for Add/Edit --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-xl shadow-2xl max-h-[90vh] flex flex-col border border-gray-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingNotice ? "Edit Existing Notice" : "Create New Notice"}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingNotice(null);
                }}
                className="text-gray-500 hover:text-gray-900 p-1 transition duration-150 rounded-lg"
              >
                <IoMdClose className="text-2xl" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmitNotice} className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter notice title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Provide detailed content for the notice"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition duration-150"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  External Link (Optional)
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  placeholder="Link to a document or external page"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition duration-150"
                  required
                >
                  <option value="student">Students Only</option>
                  <option value="faculty">Faculty Only</option>
                  <option value="both">All Users (Student & Faculty)</option>
                </select>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <CustomButton
                  variant="secondary"
                  className="!px-5 !py-2 !text-base rounded-lg border border-gray-300 hover:bg-gray-100"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowAddModal(false);
                    setEditingNotice(null);
                  }}
                >
                  Cancel
                </CustomButton>
                <CustomButton type="submit" variant="primary" className="!px-5 !py-2 !text-base rounded-lg bg-blue-600 hover:bg-blue-700 text-white">
                  {editingNotice ? "Save Changes" : "Publish Notice"}
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
        message="Confirm deletion: Are you sure you want to permanently remove this notice?"
      />
    </div>
  );
};

export default Notice;
