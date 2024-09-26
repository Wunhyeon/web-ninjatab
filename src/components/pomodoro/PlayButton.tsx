import React, { useContext } from "react";
import SettingsContext from "./SettingsContext";
import { Play } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";
import { WIDGET_TIMER_START } from "@/lib/GAEvent";

const PlayButton = ({ timerStart }: { timerStart: () => void }) => {
  const settingsInfo = useContext(SettingsContext);

  return (
    <button
      // className="bg-transparent border-0 inline-block w-24"
      className="bg-transparent text-white p-3 rounded-full hover:bg-gray-300 transition-colors duration-200 "
      aria-label="Start"
      onClick={() => {
        timerStart();
        sendGAEvent("event", WIDGET_TIMER_START.event, {
          value: WIDGET_TIMER_START.value,
        });
      }}
    >
      {/* <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="black"
        className="size-8"
      >
        <path
          fillRule="evenodd"
          d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
          clipRule="evenodd"
        />
      </svg> */}

      <Play size={32} color="black" fill="black" />
    </button>
  );
};

export default PlayButton;
