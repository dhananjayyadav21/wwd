import React from "react";

const NoData = ({ title }) => {
  return (
    // Updated container styling: Clean white card with high-contrast shadow and border.
    <div className="flex flex-col items-center justify-center w-full min-h-[40vh] my-12 py-12 px-4 bg-white rounded-xl border border-gray-300 shadow-2xl transition duration-300 ease-in-out hover:shadow-gray-400/50">

      <img
        src="/assets/empty.svg"
        alt="No data illustration"
        className="w-48 h-48 sm:w-64 sm:h-64 object-contain mb-6"
      />

      {/* Title: Dark, bold text for clear hierarchy */}
      <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center max-w-lg">
        {title || "No data available"}
      </p>

      {/* Subtext: Softer gray for guidance */}
      <p className="text-gray-600 mt-3 text-sm sm:text-base text-center max-w-sm">
        Please check your settings or try a different search query.
      </p>

    </div>
  );
};

export default NoData;
