import { WIDGET_TIMER_SKIP } from "@/lib/GAEvent";
import { sendGAEvent } from "@next/third-parties/google";
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
        sendGAEvent("event", WIDGET_TIMER_SKIP.event, {
          value: WIDGET_TIMER_SKIP.value,
        });
      }}
    >
      <SkipForwardIcon size={32} color="black" fill="black" />
    </button>
  );
};

export default SkipButton;
