import { WIDGET_TIMER_PAUSE } from "@/lib/GAEvent";
import { sendGAEvent } from "@next/third-parties/google";
import { Pause } from "lucide-react";
import React from "react";

const PauseButton = ({
  isPausedRef,
  setIsPaused,
  pauseTicking,
}: {
  isPausedRef: React.MutableRefObject<boolean>;
  setIsPaused: (paused: boolean) => void;
  pauseTicking: () => void;
}) => {
  return (
    <button
      // className="bg-transparent border-0 inline-block w-24"
      className="bg-transparent text-white p-3 rounded-full hover:bg-gray-300 transition-colors duration-200"
      aria-label="Pause"
      onClick={() => {
        isPausedRef.current = true;
        setIsPaused(true);
        pauseTicking();
        sendGAEvent("event", WIDGET_TIMER_PAUSE.event, {
          value: WIDGET_TIMER_PAUSE.value,
        });
      }}
    >
      {/* <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="black"
        className="size-6"
      >
        <path
          fillRule="evenodd"
          d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z"
          clipRule="evenodd"
        />
      </svg> */}
      <Pause size={32} color="black" />
    </button>
  );
};

export default PauseButton;
