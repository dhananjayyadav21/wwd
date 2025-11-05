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
  const [filters, setFilters] = useState({ subject: "", type: "" });

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchMaterials();
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
      setDataLoading(true);
      const queryParams = new URLSearchParams({ branch: userData.branchId._id });
      if (filters.subject) queryParams.append("subject", filters.subject);
      if (filters.type) queryParams.append("type", filters.type);

      const response = await axiosWrapper.get(`/material?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      if (response.data.success) {
        setMaterials(response.data.data);
      }
    } catch (error) {
      setMaterials([]);
      toast.error(error?.response?.data?.message || "Failed to load materials");
    } finally {
      setDataLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-6 lg:p-8 space-y-8">
      <Heading title="Study Materials" />

      {/* Filters */}
      {!dataLoading && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-4">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Subject
            </label>
            <select
              name="subject"
              value={filters.subject}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Type
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="">All Types</option>
              <option value="notes">Notes</option>
              <option value="assignment">Assignment</option>
              <option value="syllabus">Syllabus</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      )}

      {dataLoading && <Loading />}

      {/* Materials Table */}
      {!dataLoading && (
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full bg-white rounded-lg shadow-md divide-y divide-gray-200">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">File</th>
                <th className="py-3 px-4 text-left font-semibold">Title</th>
                <th className="py-3 px-4 text-left font-semibold">Subject</th>
                <th className="py-3 px-4 text-left font-semibold">Type</th>
              </tr>
            </thead>
            <tbody>
              {materials.length > 0 ? (
                materials.map((material) => (
                  <tr
                    key={material._id}
                    className="border-b hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="py-3 px-4 ">
                      <CustomButton
                        variant="primary"
                        onClick={() =>
                          window.open(
                            `${process.env.REACT_APP_MEDIA_LINK}/${material.file}`
                          )
                        }
                      >
                        <MdLink className="text-xl" />
                      </CustomButton>
                    </td>
                    <td className="py-3 px-4">{material.title}</td>
                    <td className="py-3 px-4">{material.subject.name}</td>
                    <td className="py-3 px-4 capitalize">{material.type}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
                    No materials found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile Card Layout */}
          {materials.length > 0 && (
            <div className="block sm:hidden mt-4 space-y-4">
              {materials.map((material) => (
                <div
                  key={material._id}
                  className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{material.title}</h3>
                    <CustomButton
                      variant="primary"
                      onClick={() =>
                        window.open(
                          `${process.env.REACT_APP_MEDIA_LINK}/${material.file}`
                        )
                      }
                    >
                      <MdLink className="text-xl" />
                    </CustomButton>
                  </div>
                  <p>
                    <span className="font-medium">Subject:</span>{" "}
                    {material.subject.name}
                  </p>
                  <p>
                    <span className="font-medium">Type:</span>{" "}
                    {material.type}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Material;
