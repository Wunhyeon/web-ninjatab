import { SkipForwardIcon } from "lucide-react";
import React from "react";

const SkipButton = ({ handleSkip }: { handleSkip: () => void }) => {
  return (
    <button
      // className="bg-transparent border-0 inline-block w-24"
      className="bg-transparent text-white p-3 rounded-full hover:bg-gray-300 transition-colors duration-200"
      aria-label="Skip"
      onClick={() => {
        handleSkip();
      }}
    >
      <SkipForwardIcon size={32} color="black" fill="black" />
    </button>
  );
};

export default SkipButton;
