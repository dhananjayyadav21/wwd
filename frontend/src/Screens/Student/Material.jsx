import React, { useEffect, useState } from "react";
import { MdLink } from "react-icons/md";
import Heading from "../../components/Heading";
import { useSelector } from "react-redux";
import axiosWrapper from "../../utils/AxiosWrapper";
import toast from "react-hot-toast";
import CustomButton from "../../components/CustomButton";
import Loading from "../../components/Loading";

const Material = () => {
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const userData = useSelector((state) => state.userData);
  const [filters, setFilters] = useState({
    subject: "",
    type: "",
    fromDate: "",
    toDate: "",
  });

  useEffect(() => {
    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchSubjects = async () => {
    try {
      setDataLoading(true);
      const response = await axiosWrapper.get(
        `/subject?branch=${userData.branchId._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      if (response.data.success) {
        setSubjects(response.data.data);
      }
    } catch (error) {
      setSubjects([]);
      toast.error(error?.response?.data?.message || "Failed to load subjects");
    } finally {
      setDataLoading(false);
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
      toast.dismiss();
      if (response.data.success) {
        setMaterials(response.data.data);
        toast.success("load materials");
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
      console.log("load materials")
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full mx-auto sm:p-6 md:p-10 sm:rounded-xl sm:shadow-lg space-y-8">
      <Heading title="Study Materials" />

      {/* Filters */}
      {!dataLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white shadow-sm rounded-2xl p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              name="subject"
              value={filters.subject}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="notes">Notes</option>
              <option value="assignment">Assignment</option>
              <option value="syllabus">Syllabus</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none"
            />
          </div>
        </div>
      )}

      {dataLoading && <Loading />}

      {/* Materials */}
      {!dataLoading && (
        <div>
          {materials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((material) => (
                <div
                  key={material._id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col justify-between  border-2"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {material.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium text-gray-800">Subject:</span>{" "}
                      {material.subject?.name}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium text-gray-800">Type:</span>{" "}
                      {material.type}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-800">Date:</span>{" "}
                      {material.date
                        ? new Date(material.date).toISOString().split("T")[0]
                        : "Not Available"}
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <CustomButton
                      variant="primary"
                      onClick={() => window.open(material.materialLink)}
                      className="flex items-center gap-2"
                    >
                      <MdLink className="text-xl" />
                      Open
                    </CustomButton>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl shadow-inner">
              <p className="text-gray-700 font-medium text-lg">
                No materials found.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Material;
