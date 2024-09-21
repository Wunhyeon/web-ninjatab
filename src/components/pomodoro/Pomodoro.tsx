"use client";

import React, { useState } from "react";
import Timer from "./Timer";

const Pomodoro = ({
  savedWorkMinutes,
  savedBreakMinuts,
  timerId,
}: {
  savedWorkMinutes: number;
  savedBreakMinuts: number;
  timerId: string;
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [workMinutes, setWorkMinutes] = useState(savedWorkMinutes);
  const [breakMinutes, setBreakMinutes] = useState(savedBreakMinuts);

  return (
    <main className="py-12 h-full w-full my-0 mx-auto text-center bg-blue-900 ">
      {/* <SettingsContext.Provider
        value={{
          workMinutes,
          breakMinutes,
          setWorkMinutes,
          setBreakMinutes,
          showSettings,
          setShowSettings,
        }}
      > */}
      {/* {showSettings ? <Settings /> : <Timer timerId={timerId} />} */}
      {/* </SettingsContext.Provider> */}
      <Timer
        timerId={timerId}
        workMinutes={workMinutes}
        breakMinutes={breakMinutes}
      />
    </main>
  );
};

export default Pomodoro;
