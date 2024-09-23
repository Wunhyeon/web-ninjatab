"use client";

import React, { useState } from "react";
import Timer from "./Timer";

const Pomodoro = ({
  timerId,
  savedWorkMinutes,
  savedBreakMinuts,
  alarmSoundOn,
  tickingSoundOn,
}: {
  timerId: string;
  savedWorkMinutes: number;
  savedBreakMinuts: number;
  alarmSoundOn: boolean;
  tickingSoundOn: boolean;
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [workMinutes, setWorkMinutes] = useState(savedWorkMinutes);
  const [breakMinutes, setBreakMinutes] = useState(savedBreakMinuts);

  return (
    <main className="h-screen">
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
        alarmSoundOn={alarmSoundOn}
        tickingSoundOn={tickingSoundOn}
      />
    </main>
  );
};

export default Pomodoro;
