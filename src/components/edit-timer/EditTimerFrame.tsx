"use client";

import { getNotionInfo } from "@/action/timerAction";
import DatabaseInfo from "@/components/edit-timer/DatabaseInfo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LOGIN_AGAIN } from "@/lib/constant";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import TimerEditCard from "./TimerEditCard";
import { Accordion, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { AccordionContent } from "@radix-ui/react-accordion";
import { Separator } from "../ui/separator";
import CopyLinkCard from "./CopyLinkCard";
import CopyLinkDialog from "./CopyLinkDialog";
import SoundEditCard from "./SoundEditCard";
import ThemeEditCard from "./ThemeEditCard";
import { sendGAEvent } from "@next/third-parties/google";
import {
  EDIT_TIMER_DATABASE_OPEN,
  EDIT_TIMER_SOUND_OPEN,
  EDIT_TIMER_THEME_OPEN,
  EDIT_TIMER_TIMER_OPEN,
} from "@/lib/GAEvent";
import GeneralEditCard from "./GeneralEditCard";

const EditTimerFrame = ({
  timerId,
  timerName,
  userNotionInfo,
  databaseName,
  workTime,
  breakTime,
  alarmSoundOn,
  tickingSoundOn,
}: {
  timerId: string;
  timerName: string;
  userNotionInfo: {
    id: string;
    workspace_name: string;
  }[];
  databaseName: string | null;
  workTime: number;
  breakTime: number;
  alarmSoundOn: boolean;
  tickingSoundOn: boolean;
}) => {
  const [name, setName] = useState<string>(timerName);

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="text-4xl font-extrabold">{name}</CardTitle>
        <CardDescription>Manage your pomodoro timer.</CardDescription>
      </CardHeader>

      <div className="absolute top-5 right-3">
        <CopyLinkDialog timerId={timerId} databaseName={databaseName} />
      </div>
      <CardContent className="flex-col">
        {/* <CopyLinkCard
          timerId={timerId}
          databaseName={
            // timerInfo.data[0].notion_database_info.length
            //   ? timerInfo.data[0].notion_database_info[0].database_name
            //   : null
            "Connected Datbase Name"
          }
        /> */}
        {/* notion */}
        <div className="flex items-center gap-1 text-2xl font-semibold my-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>

          <h3>Settings</h3>
        </div>
        <Separator />
        <Accordion type="single" collapsible>
          <AccordionItem value="timer">
            <AccordionTrigger
              onClick={() => {
                sendGAEvent("event", EDIT_TIMER_TIMER_OPEN.event, {
                  value: EDIT_TIMER_TIMER_OPEN.value,
                });
              }}
            >
              <div className="flex gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                Timer
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <TimerEditCard
                timerId={timerId}
                workTime={workTime}
                breakTime={breakTime}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="sound">
            <AccordionTrigger
              onClick={() => {
                sendGAEvent("event", EDIT_TIMER_SOUND_OPEN.event, {
                  value: EDIT_TIMER_SOUND_OPEN.value,
                });
              }}
            >
              <div className="flex gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
                  />
                </svg>
                Sound
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <SoundEditCard
                timerId={timerId}
                alarmSoundOn={alarmSoundOn}
                tickingSoundOn={tickingSoundOn}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="theme">
            <AccordionTrigger
              onClick={() => {
                sendGAEvent("event", EDIT_TIMER_THEME_OPEN.event, {
                  value: EDIT_TIMER_THEME_OPEN.value,
                });
              }}
            >
              <div className="flex gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                  />
                </svg>
                Theme
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ThemeEditCard />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="database">
            <AccordionTrigger
              onClick={() => {
                sendGAEvent("event", EDIT_TIMER_DATABASE_OPEN.event, {
                  value: EDIT_TIMER_DATABASE_OPEN.event,
                });
              }}
            >
              <div className="flex gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5"
                  />
                </svg>
                Database
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <DatabaseInfo timerId={timerId} userNotionInfo={userNotionInfo} />
            </AccordionContent>
          </AccordionItem>
          {/* General */}
          <AccordionItem value="general">
            <AccordionTrigger
              onClick={() => {
                sendGAEvent("event", EDIT_TIMER_THEME_OPEN.event, {
                  value: EDIT_TIMER_THEME_OPEN.value,
                });
              }}
            >
              <div className="flex gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                  />
                </svg>
                General
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <GeneralEditCard
                timerId={timerId}
                timerName={name}
                setTimerName={setName}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter>
        {/* <div className="text-xs text-muted-foreground">
          Showing <strong>1-10</strong> of <strong>32</strong> products
        </div> */}
        <div className="text-gray-500 text-sm">
          After Setting, Please Refresh the notion page. <br />
          Window : Ctrl + R<br />
          Mac : CMD + R
        </div>
      </CardFooter>
    </Card>
  );
};

export default EditTimerFrame;
