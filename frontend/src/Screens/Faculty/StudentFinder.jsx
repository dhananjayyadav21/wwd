import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Heading from "../../components/Heading";
import axiosWrapper from "../../utils/AxiosWrapper";
import CustomButton from "../../components/CustomButton";
import NoData from "../../components/NoData";

const StudentFinder = () => {
  const [searchParams, setSearchParams] = useState({
    enrollmentNo: "",
    name: "",
    branch: "",
  });
  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const userToken = localStorage.getItem("userToken");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        toast.loading("Loading branches...");
        const response = await axiosWrapper.get("/branch", {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        if (response.data.success) setBranches(response.data.data);
        else toast.error(response.data.message);
      } catch (error) {
        if (error.response?.status === 404) setBranches([]);
        else toast.error(error.response?.data?.message || "Failed to load branches");
      } finally {
        toast.dismiss();
      }
    };
    fetchBranches();
  }, [userToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const searchStudents = async (e) => {
    e.preventDefault();
    setDataLoading(true);
    setHasSearched(true);
    toast.loading("Searching students...");
    setStudents([]);
    try {
      const response = await axiosWrapper.post(`/student/search`, searchParams, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      toast.dismiss();
      if (response.data.success) {
        if (response.data.data.length === 0) {
          toast.error("No students found!");
          setStudents([]);
        } else {
          toast.success("Students found!");
          setStudents(response.data.data);
        }
      } else toast.error(response.data.message);
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error searching students");
    } finally {
      setDataLoading(false);
    }
  };

  const handleRowClick = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto mt-10 mb-10 p-4 sm:p-6 md:p-8 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <Heading title="Student Finder" />
      </div>

      {/* Search Form */}
      <form onSubmit={searchStudents} className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Number</label>
            <input
              type="text"
              name="enrollmentNo"
              value={searchParams.enrollmentNo}
              onChange={handleInputChange}
              placeholder="Enter enrollment number"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={searchParams.name}
              onChange={handleInputChange}
              placeholder="Enter student name"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
            <select
              name="branch"
              value={searchParams.branch}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="">Select Branch</option>
              {branches?.map((branch) => (
                <option key={branch._id} value={branch._id}>{branch.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <CustomButton type="submit" disabled={dataLoading} variant="primary" className="w-full">
              {dataLoading ? "Searching..." : "Search"}
            </CustomButton>
          </div>
        </div>
      </form>

      {/* No Filter Selected */}
      {!hasSearched && (
        <div className="text-center mt-10 text-gray-600 flex flex-col items-center justify-center p-10 bg-white rounded-xl shadow-md mx-auto w-full sm:w-3/4 md:w-1/2">
          <img src="/assets/filter.svg" alt="Select filters" className="w-48 h-48 mb-4" />
          Please select at least one filter to search students
        </div>
      )}

      {/* No Data Found */}
      {hasSearched && students.length === 0 && <NoData title="No students found" />}

      {/* Students Table */}
      {students.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Profile</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Enrollment No</th>
                  <th className="px-4 py-3 text-left">Batch</th>
                  <th className="px-4 py-3 text-left">Career Aspiring</th>
                  <th className="px-4 py-3 text-left">Email</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student._id}
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => handleRowClick(student)}
                  >
                    <td className="px-4 py-3">
                      <img
                        src={`${process.env.REACT_APP_MEDIA_LINK}/${student.profile}`}
                        alt={`${student.firstName}'s profile`}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "/assets/user.avif";
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">{`${student?.firstName} ${student?.middleName} ${student?.lastName}`}</td>
                    <td className="px-4 py-3">{student?.enrollmentNo}</td>
                    <td className="px-4 py-3">{student?.branchId?.name}</td>
                    <td className="px-4 py-3">{student?.aspiring}</td>
                    <td className="px-4 py-3">{student?.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">Student Details</h2>
              <CustomButton onClick={() => setShowModal(false)} variant="secondary">
                ✕
              </CustomButton>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="md:w-1/3">
                <img
                  src={`${process.env.REACT_APP_MEDIA_LINK}/${selectedStudent.profile}`}
                  alt={`${selectedStudent.firstName}'s profile`}
                  className="w-full h-auto object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1744315900478-fa44dc6a4e89?q=80&w=3087&auto=format&fit=crop";
                  }}
                />
              </div>
              <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Personal Info</h3>
                  <p><span className="font-medium">Full Name:</span> {`${selectedStudent.firstName} ${selectedStudent.middleName} ${selectedStudent.lastName}`}</p>
                  <p><span className="font-medium">Gender:</span> {selectedStudent.gender}</p>
                  <p><span className="font-medium">DOB:</span> {new Date(selectedStudent.dob).toLocaleDateString()}</p>
                  <p><span className="font-medium">Blood Group:</span> {selectedStudent.bloodGroup}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Academic Info</h3>
                  <p><span className="font-medium">Enrollment No:</span> {selectedStudent.enrollmentNo}</p>
                  <p><span className="font-medium">Batch:</span> {selectedStudent.branchId?.name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Contact Info</h3>
                  <p><span className="font-medium">Email:</span> {selectedStudent.email}</p>
                  <p><span className="font-medium">Phone:</span> {selectedStudent.phone}</p>
                  <p><span className="font-medium">Address:</span> {selectedStudent.address}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Location</h3>
                  <p><span className="font-medium">City:</span> {selectedStudent.city}</p>
                  <p><span className="font-medium">State:</span> {selectedStudent.state}</p>
                  <p><span className="font-medium">Pincode:</span> {selectedStudent.pincode}</p>
                  <p><span className="font-medium">Country:</span> {selectedStudent.country}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFinder;
