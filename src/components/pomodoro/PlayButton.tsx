import React, { useContext } from "react";
import SettingsContext from "./SettingsContext";

const PlayButton = ({
  isPausedRef,
  setIsPaused,
  startDateRef,
}: {
  isPausedRef: React.MutableRefObject<boolean>;
  setIsPaused: (paused: boolean) => void;
  startDateRef: React.MutableRefObject<Date | undefined>;
}) => {
  const settingsInfo = useContext(SettingsContext);

  return (
    <button
      className="bg-transparent border-0 inline-block w-24"
      onClick={() => {
        isPausedRef.current = false;
        setIsPaused(false);
        startDateRef.current = new Date();
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="#dfdcdc"
      >
        <path
          fillRule="evenodd"
          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm14.024-.983a1.125 1.125 0 0 1 0 1.966l-5.603 3.113A1.125 1.125 0 0 1 9 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113Z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
};

export default PlayButton;
