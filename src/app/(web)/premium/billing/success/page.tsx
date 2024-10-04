import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Thank You for Subscribing!
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for subscribing! Together, we&apos;ll make the most of your
          time!
        </p>
        <Link
          href="/my-timers"
          className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
        >
          Go to Create Timer
        </Link>
      </div>
    </div>
  );
};

export default page;
