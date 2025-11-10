import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axiosWrapper from "../../utils/AxiosWrapper";
import Heading from "../../components/Heading";
import { useSelector } from "react-redux";

const ViewMarks = () => {
  // eslint-disable-next-line
  const userData = useSelector((state) => state.userData);

  const [dataLoading, setDataLoading] = useState(false);
  const [marks, setMarks] = useState([]);
  const userToken = localStorage.getItem("userToken");

  const fetchMarks = async () => {
    setDataLoading(true);
    toast.loading("Loading marks...");
    try {
      const response = await axiosWrapper.get(`/marks/student`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (response.data.success) {
        setMarks(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching marks");
    } finally {
      setDataLoading(false);
      toast.dismiss();
    }
  };

  useEffect(() => {
    fetchMarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // semester selection removed from UI

  const midTermMarks = marks.filter((mark) => mark.examId.examType === "mid");
  const endTermMarks = marks.filter((mark) => mark.examId.examType === "end");

  return (
    <div className="w-full mx-auto p-2 mt-10 flex justify-center items-start flex-col mb-10">
      <div className="flex justify-between items-center w-full mb-6">
        <Heading title="View Marks" />
        {/* Semester filter removed from View Marks UI */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Mid Term Marks</h2>
          {dataLoading ? (
            <p className="text-gray-900">Loading...</p>
          ) : midTermMarks.length > 0 ? (
            <div className="space-y-4">
              {midTermMarks.map((mark) => (
                <div
                  key={mark._id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">
                        {mark?.subjectId?.name}
                      </p>
                      <p className="text-sm text-gray-900">
                        {mark?.examId?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-blue-600">
                        {mark?.marksObtained}
                      </p>
                      <p className="text-sm text-gray-900">
                        out of {mark?.examId?.totalMarks}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-900">No mid term marks available</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Saturday Test Marks</h2>
          {dataLoading ? (
            <p className="text-gray-900">Loading...</p>
          ) : endTermMarks.length > 0 ? (
            <div className="space-y-4">
              {endTermMarks.map((mark) => (
                <div
                  key={mark._id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">
                        {/* {mark?.subjectId?.name} */}
                      </p>
                      <p className="text-sm text-gray-900">
                        {mark?.examId?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-blue-600">
                        {mark?.marksObtained}
                      </p>
                      <p className="text-sm text-gray-900">
                        out of {mark?.examId?.totalMarks}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-900">No saturday test marks available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewMarks;
