"use client";

import { HeatmapMap, HeatmapObject } from "@/lib/types";
import React, { FocusEvent, useEffect, useRef, useState } from "react";
import ActivityCalendar, { ThemeInput } from "react-activity-calendar";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import Link from "next/link";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import { Button, buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { heatmapNameUpdate } from "@/action/timerAction";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { ORIGIN } from "@/lib/constant";

// notion 어플리케이션이거나 브라우저에서 notion을 켰을 때
function isNotion() {
  const userAgent = window.navigator.userAgent;
  const ancestor = window.location.ancestorOrigins;

  if (
    userAgent.includes("Notion") ||
    userAgent.includes("notion") ||
    (ancestor && ancestor.length > 0 && ancestor[0].includes("notion.so"))
  ) {
    return true;
  }

  return false;
}

const HeatmapDialogListItem = ({
  heatmapId,
  pageName,
  url,
  date,
  mp,
  timerId,
  setIsOpen,
  pageId,
}: {
  heatmapId: string;
  pageName: string;
  date: string;
  url: string;
  mp: HeatmapMap;
  timerId: string;
  setIsOpen: (open: boolean) => void;
  pageId?: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(pageName);
  const router = useRouter();

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && relatedTarget.textContent === "Edit") {
      return;
    }

    setIsEditing(false); // 포커스가 나가면 인풋 닫기
  };

  const handleEditClick = async () => {
    const supabase = createClient();
    const user = await supabase.auth.getUser();

    const userAgent = window.navigator.userAgent;

    if (isNotion()) {
      // notion 앱일때
      window.open(window.location.href, "_blank", "noopener,noreferrer");
      setIsOpen(false);
      return;
    } else {
      // notion 앱 아닐때

      if (!user.data.user) {
        router.push(
          `/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`
        );

        return;
      }
      setIsEditing(true);
    }
  };

  const handleUpdate = async () => {
    const supabase = createClient();
    const user = await supabase.auth.getUser();

    if (!user.data.user) {
      // router.push("/please-login");

      router.push(
        `/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }
    const { success } = await heatmapNameUpdate(
      heatmapId,
      name,
      timerId,
      pageId
    );
    if (success) {
      mp.get(date)?.object.forEach((el) => {
        if (el.id === heatmapId) {
          el.name = name;
        }
      });

      toast.success("Name Updated!");

      setIsEditing(false);
    }
  };

  return (
    <div className="flex gap-2">
      {isEditing ? (
        <div className="flex items-center">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleBlur}
            className="h-5 w-3/4 m-2 text-lg"
            autoFocus
          />
          <Button
            className="rounded-lg h-3/4 flex justify-center items-center"
            onClick={handleUpdate}
          >
            Edit
          </Button>
        </div>
      ) : (
        <div className="flex gap-3 items-center">
          {isNotion() ? (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    onClick={async () => {
                      await handleEditClick();
                    }}
                    className="cursor-pointer"
                  >
                    {name}

                    <Button variant="link" className="text-zinc-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                        />
                      </svg>
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Edits cannot be made within the Notion app.
                    <br />
                    Please click to open in your web browser.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span
              onClick={async () => {
                await handleEditClick();
              }}
              className="cursor-pointer"
            >
              {name}

              <Button variant="link" className="text-zinc-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                  />
                </svg>
              </Button>
            </span>
          )}

          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={url}
                  target="_blank"
                  className={cn("flex justify-center items-center")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                    />
                  </svg>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>It opens in a new tab.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};

const HeatmapDialog = ({
  isOpen,
  setIsOpen,
  date,
  object,
  timerId,
  mp,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  date: string;
  object: {
    id: string;
    name: string;
    pageId: string;
    start: string;
    end?: string;
    url: string;
  }[];
  timerId: string;
  mp: HeatmapMap;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{date}</DialogTitle>
          <DialogDescription>
            {object.length} activities on {date}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[100px] w-full">
          {object.map((el) => {
            return (
              <HeatmapDialogListItem
                heatmapId={el.id}
                pageId={el.pageId}
                pageName={el.name}
                date={date}
                mp={mp}
                url={el.url}
                key={el.pageId}
                setIsOpen={setIsOpen}
                timerId={timerId}
              />
            );
          })}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export const Heatmap = ({
  data,
  mp,
  timerId,
}: {
  data: {
    date: string;
    count: number;
    level: number;
  }[];
  mp: HeatmapMap;
  timerId: string;
}) => {
  const explicitTheme: ThemeInput = {
    light: ["#f0f0f0", "#c4edde", "#7ac7c4", "#f73859", "#384259"],
    dark: ["#383838", "#4D455D", "#7DB9B6", "#F5E9CF", "#E96479"],
  };

  const [isOpen, setIsOpen] = useState(false);
  const dateRef = useRef("");
  const objectRef = useRef<HeatmapObject[]>([]);

  return (
    <div className="text-3x">
      <ActivityCalendar
        data={data}
        renderBlock={(block, activity) =>
          React.cloneElement(block, {
            "data-tooltip-id": "react-tooltip",
            "data-tooltip-html": `<div><h3 class="text-xl">${activity.date}</h3>
          
             ${
               mp.get(activity.date) && mp.get(activity.date)!.object.length > 0
                 ? "<h5 class='text-lg font-semibold'>Done List</h5>" +
                   mp
                     .get(activity.date)
                     ?.object.map((el, idx) => {
                       return `<div key={idx}>● ${el.name}</div>`;
                     })
                     .join("")
                 : ""
             }
             <br/>
            ${activity.count} activities on ${activity.date}</div>`,
          })
        }
        theme={explicitTheme}
        blockSize={16}
        showWeekdayLabels={true}
        eventHandlers={{
          onClick: (event) => (activity) => {
            // alert(JSON.stringify(activity));
            // 여기다가 Dialog open 이벤트를 넣을거야.
            dateRef.current = activity.date;
            objectRef.current =
              mp.get(activity.date) && mp.get(activity.date)!.object.length > 0
                ? mp.get(activity.date)!.object
                : [];
            setIsOpen(true);
          },
        }}
      />
      <ReactTooltip id="react-tooltip" />
      <HeatmapDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        date={dateRef.current}
        object={objectRef.current}
        timerId={timerId}
        mp={mp}
      />
    </div>
  );
};
