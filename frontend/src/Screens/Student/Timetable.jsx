import React, { useEffect, useState } from "react";
import { FiExternalLink } from "react-icons/fi";
import Heading from "../../components/Heading";
import { useSelector } from "react-redux";
import axiosWrapper from "../../utils/AxiosWrapper";
import { toast } from "react-hot-toast";
import Loading from "../../components/Loading";

const Timetable = () => {
  const [timetable, setTimetable] = useState(null);
  const userData = useSelector((state) => state.userData);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    const getTimetable = async () => {
      try {
        setDataLoading(true);
        const response = await axiosWrapper.get(
          `/timetable?branch=${userData.branchId?._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
          }
        );
        if (response.data.success && response.data.data.length > 0) {
          setTimetable(response.data.data[0]);
          toast.success("load timtable")
        } else {
          setTimetable(null);
        }
      } catch (error) {
        if (error?.response?.status === 404) {
          setTimetable(null);
          return;
        }
        toast.error(error.response?.data?.message || "Error fetching timetable");
        console.error(error);
      } finally {
        setDataLoading(false);
      }
    };
    userData && getTimetable();
  }, [userData, userData.branchId]);

  return (
    <div className="w-full mx-auto sm:p-6 md:p-10 flex flex-col mb-10">
      <div className="flex justify-between items-center w-full">
        <Heading title="Timetable" />
      </div>

      {dataLoading && <Loading />}

      {!dataLoading && timetable && (
        <div className="mt-8 w-full md:w-3/4 mx-auto bg-white shadow-md rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {timetable.title || "Branch Timetable"}
            </h2>
            <button
              onClick={() => window.open(timetable.link, "_blank")}
              className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-600 transition-all duration-200"
            >
              <FiExternalLink className="text-lg" />
              Open Link
            </button>
          </div>

          {/* <div className="w-full flex justify-center">
            <img
              className="rounded-xl shadow-md max-w-full h-auto border border-gray-200"
              src={process.env.REACT_APP_MEDIA_LINK + "/" + timetable.link}
              alt="Timetable"
            />
          </div> */}
        </div>
      )}

      {!dataLoading && !timetable && (
        <p className="mt-10 text-gray-600 text-center text-lg">
          No Timetable Available At The Moment!
        </p>
      )}
    </div>
  );
};

export default Timetable;
