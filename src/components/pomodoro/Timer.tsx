"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import PlayButton from "./PlayButton";
import PauseButton from "./PauseButton";
import SettingsButton from "./SettingsButton";
import SettingsContext from "./SettingsContext";
import { ORIGIN } from "@/lib/constant";
import { toast } from "sonner";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import {
  insertNewPageToDBWithoutDate,
  updatePageDate,
} from "@/action/timerAction";
import { TimeZone } from "@/lib/types";
import { Input } from "../ui/input";
import { Coffee, Flame, Pause, Play, SkipForward } from "lucide-react";
import SkipButton from "./SkipButton";
import { sendGAEvent } from "@next/third-parties/google";
import { WIDGET_TIMER_LOGO_LINK, WIDGET_TIMER_SETTING } from "@/lib/GAEvent";

const Timer = ({
  timerId,
  workMinutes,
  breakMinutes,
  alarmSoundOn,
  tickingSoundOn,
}: {
  timerId: string;
  workMinutes: number;
  breakMinutes: number;
  alarmSoundOn: boolean;
  tickingSoundOn: boolean;
}) => {
  const red = "#f54e4e";
  const green = "#4aec8c";
  // const settingsInfo = useContext(SettingsContext);

  const [isPaused, setIsPaused] = useState(true);
  const [mode, setMode] = useState("work"); // work, break, null
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [subject, setSubject] = useState("");
  const [isNewSubjectStart, setIsNewSubjectStart] = useState(true); // 각 task가 시작될 때, 처음 시작되는 start. pause 하고 다시 실행하는게 아니라.

  const secondsLeftRef = useRef(secondsLeft);
  const isPausedRef = useRef(isPaused);
  const modeRef = useRef(mode);
  const subjRef = useRef(subject);
  // const startDateRef: React.MutableRefObject<Date | undefined> = useRef();
  const startDateRef = useRef("");
  const alarmSoundRef = useRef<HTMLAudioElement | null>(null);
  const tickingSoundRef = useRef<HTMLAudioElement | null>(null);
  const pageIdRef = useRef("");

  const timerStart = async () => {
    isPausedRef.current = false;
    setIsPaused(false);

    if (isNewSubjectStart) {
      // 새로운 task 가 시작될 때.
      startDateRef.current = new Date().toISOString();
      setIsNewSubjectStart(false);
      // 데이터베이스에 page 넣고 page id 받아오기. 타이머가 다 되서 멈출 때, 이 페이지의 date에 시작시간과 끝시간을 업데이트 한다.
      const result = await insertNewPageToDBWithoutDate(
        timerId,
        subjRef.current
      );
      if (!result) {
        toast.error("Failed to Create Page Row. Please Try Again 🙇‍♂️", {
          duration: Infinity,
        });
        return;
      }
      const parseResult: { success: boolean; pageId: string; err: unknown } =
        JSON.parse(result);
      if (!parseResult.success) {
        // error handling
        return;
      }
      pageIdRef.current = parseResult.pageId;
    }
  };

  const pauseTicking = () => {
    if (tickingSoundRef.current) {
      tickingSoundRef.current.pause();
    }
  };

  const initTimer = () => {
    setSecondsLeft(workMinutes * 60);
    secondsLeftRef.current = workMinutes * 60;
  };

  const switchMode = () => {
    const nextMode = modeRef.current === "work" ? "break" : "work";
    const nextSeconds = (nextMode === "work" ? workMinutes : breakMinutes) * 60;
    setMode(nextMode);

    if (nextMode == "work") {
      setIsNewSubjectStart(true);
    }

    modeRef.current = nextMode;
    setSecondsLeft(nextSeconds);
    secondsLeftRef.current = nextSeconds;
    isPausedRef.current = true;
    setIsPaused(isPausedRef.current);
  };

  const tick = () => {
    secondsLeftRef.current--;
    setSecondsLeft((prev) => prev - 1);
    if (tickingSoundRef.current && tickingSoundOn) {
      tickingSoundRef.current.play();
    }
  };

  const someF = async () => {
    // alert(`some Function. subject : ${subject}, subjRef : ${subjRef.current}`);
    const endTime = new Date();
    // const offset = endTime.getTimezoneOffset() * 60000;
    // const start = new Date(startDateRef.current!.getTime() - offset);
    const start = startDateRef.current;
    const end = endTime.toISOString();
    const updateResult = await updatePageDate(
      timerId,
      pageIdRef.current,
      subjRef.current,
      start,
      end
      // Intl.DateTimeFormat().resolvedOptions().timeZone as TimeZone
    );

    subjRef.current = "";

    if (!updateResult?.success && updateResult?.err === "missingProperty") {
      // toast.error(`Please make ${updateResult.property} column`, {
      //   duration: Infinity,
      //   closeButton: true,
      // });

      toast.error("Please Check 'Name' and 'Date' Column in Database", {
        duration: Infinity,
        closeButton: true,
      });
    }
  };

  const handleSkip = () => {
    if (modeRef.current === "work") {
      someF();
    }
    if (tickingSoundRef.current) {
      tickingSoundRef.current.pause();
    }

    return switchMode();
  };

  useEffect(() => {
    initTimer();
  }, [workMinutes, breakMinutes]);

  useEffect(() => {
    // initTimer();
    console.log("useEffect");

    const interval = setInterval(() => {
      if (isPausedRef.current) {
        return;
      }

      if (secondsLeftRef.current === 0) {
        if (modeRef.current === "work") {
          someF();
        }
        if (tickingSoundRef.current) {
          tickingSoundRef.current.pause();
        }
        if (alarmSoundRef.current && alarmSoundOn) {
          alarmSoundRef.current.play();
        }
        return switchMode();
      }
      tick();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isPausedRef]);

  const totalSeconds = mode === "work" ? workMinutes * 60 : breakMinutes * 60;
  const percentage = (secondsLeft / totalSeconds) * 100;

  const minutes = Math.floor(secondsLeft / 60);
  let numberSeconds = Math.floor(secondsLeft % 60);
  let seconds = numberSeconds.toString();
  if (numberSeconds < 10) {
    seconds = "0" + seconds;
  }

  return (
    <div className="bg-white text-black p-1 sm:p-2 h-full flex flex-col transition-all duration-300 ease-in-out w-full overflow-hidden">
      <div className="bg-gray-100 p-2 sm:p-3 rounded-lg mb-2 sm:mb-4 flex-grow flex flex-col justify-between">
        <div className="flex justify-between items-center mb-1 sm:mb-2">
          <h1 className="text-lg sm:text-xl font-bold">
            <Link
              href={`${ORIGIN}`}
              target="_blank"
              onClick={() => {
                sendGAEvent("event", WIDGET_TIMER_LOGO_LINK.event, {
                  value: WIDGET_TIMER_LOGO_LINK.value,
                });
              }}
            >
              PomoLog
            </Link>
          </h1>
          <div className="flex space-x-2">
            <Link
              href={`${ORIGIN}/edit-timer/${timerId}`}
              onClick={() => {
                sendGAEvent("event", WIDGET_TIMER_SETTING.event, {
                  value: WIDGET_TIMER_SETTING.value,
                });
              }}
              target="_blank"
              className={cn(
                buttonVariants({ variant: "default" }),
                "bg-gray-200 px-2 py-1 rounded text-xs sm:text-sm text-black hover:bg-gray-300"
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="black"
                className="w-4 sm:w-5 float-left mr-1"
              >
                <path
                  fillRule="evenodd"
                  d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
                  clipRule="evenodd"
                />
              </svg>
              Setting
            </Link>
          </div>
        </div>
        {/* {modeRef.current === 'work' } */}
        <div
          className={`flex items-center justify-center mb-1 text-sm sm:text-base font-semibold `}
        >
          {modeRef.current === "work" ? (
            <>
              <span className="mr-2">Work Time</span>
              <Flame size={20} />
            </>
          ) : (
            <>
              <span className="mr-2">Break Time</span>
              <Coffee size={20} />
            </>
          )}
        </div>
        <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-center mb-2">
          {minutes}:{seconds}
        </div>
        <div className="mb-2">
          {modeRef.current === "work" ? (
            <Input
              type="text"
              onChange={(e) => {
                setSubject(e.target.value);
                subjRef.current = e.target.value;
              }}
              className="w-full p-2 rounded bg-white border border-gray-300 text-black placeholder-gray-500 text-sm sm:text-base"
              placeholder="What are you working on?"
            />
          ) : (
            <></>
          )}
        </div>
        <div className="flex justify-center space-x-4">
          {isPaused ? (
            <PlayButton timerStart={timerStart} />
          ) : (
            <>
              <PauseButton
                isPausedRef={isPausedRef}
                setIsPaused={setIsPaused}
                pauseTicking={pauseTicking}
              />
              <SkipButton handleSkip={handleSkip} />
            </>
          )}
        </div>
        {/* alarm sound */}
        <audio ref={alarmSoundRef} src="/alarm.wav" />
        {/* ticking sound */}
        <audio ref={tickingSoundRef} src="/ticking.wav" loop />
      </div>
    </div>
  );
};

export default Timer;
