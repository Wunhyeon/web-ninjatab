import React from "react";

export default function Maintenance() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center ">
      <h1 className="text-5xl font-bold text-gray-800 mb-4">
        Under Maintenance
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        We are currently undergoing maintenance. Thank you for your
        understanding 🙇‍♂️.
      </p>
      {/* <div className="flex items-center">
        <svg
          className="animate-spin h-8 w-8 text-gray-600 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.963 7.963 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span className="text-gray-600">
          Please be patient while we work on this.
        </span>
      </div> */}
    </div>
  );
}
