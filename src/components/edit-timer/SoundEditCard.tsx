"use client";

import React, { useCallback, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { UpdateTimerSoundSchema } from "@/zodSchema/UpdateTimerSoundSchema";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Checkbox } from "../ui/checkbox";
import Link from "next/link";
import { updateTimerSound } from "@/action/timerAction";
import { sendGAEvent } from "@next/third-parties/google";
import { EDIT_TIMER_SOUND_UPDATE_BTN } from "@/lib/GAEvent";

const SoundEditCard = ({
  timerId,
  alarmSoundOn,
  tickingSoundOn,
}: {
  timerId: string;
  alarmSoundOn: boolean;
  tickingSoundOn: boolean;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isLoadingRef = useRef(false);

  function useReRenderer() {
    const [, setState] = useState({});
    return useCallback(() => setState({}), []);
  }

  const reRender = useReRenderer();

  const updateTimerSoundForm = useForm<z.infer<typeof UpdateTimerSoundSchema>>({
    resolver: zodResolver(UpdateTimerSoundSchema),
    defaultValues: {
      alarmSoundId: null,
      alarmSoundVolume: 50,
      alarmSoundOn: alarmSoundOn,
      tickingSoundId: null,
      tickingSoundVolume: 50,
      tickingSoundOn: tickingSoundOn,
    },
  });

  async function onSubmit(data: z.infer<typeof UpdateTimerSoundSchema>) {
    // 따닥 방지하기!
    if (isLoadingRef.current) {
      return;
    }
    isLoadingRef.current = true;
    setIsLoading(true);
    reRender();

    const result = await updateTimerSound(
      timerId,
      data.alarmSoundOn,
      data.tickingSoundOn
    );

    if (result.success === true) {
      // toast.success("Time Updated ", { duration: Infinity });
      toast(
        <div className="text-[#008A2E]">
          <strong className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            &nbsp;Sound Updated!
          </strong>
          Please Refresh the notion page. <br />
          Window : Ctrl + R<br />
          Mac : CMD + R
        </div>,
        {
          duration: Infinity,
          closeButton: true,
          richColors: true,
          style: { background: "#EDFDF3" },
        }
      );
    } else {
      toast.error("Sorry. Something wrong. please try again 🙏");
    }

    isLoadingRef.current = false;
    setIsLoading(false);
    reRender();
  }
  return (
    <div className="relative">
      <Card
        className={`relative ${
          isLoading ? "filter blur-sm pointer-events-none" : ""
        }`}
      >
        <CardHeader>
          <CardTitle>Sound</CardTitle>
          <CardDescription>Edit Timer Sound</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...updateTimerSoundForm}>
            <form
              onSubmit={updateTimerSoundForm.handleSubmit(onSubmit)}
              className="space-y-8"
            >
              <div className="flex-col gap-6 space-y-3">
                <FormField
                  control={updateTimerSoundForm.control}
                  name="alarmSoundOn"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Alarm Sound 🔈</FormLabel>
                        <FormDescription>
                          An alarm will sound when the timer ends.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateTimerSoundForm.control}
                  name="tickingSoundOn"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Ticking Sound ⏰</FormLabel>
                        <FormDescription>
                          A ticking sound plays while the timer is running.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                disabled={isLoadingRef.current}
                onClick={() => {
                  sendGAEvent("event", EDIT_TIMER_SOUND_UPDATE_BTN.event, {
                    value: EDIT_TIMER_SOUND_UPDATE_BTN.value,
                  });
                }}
              >
                Update
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
          We are continuously updating!
        </CardFooter>
      </Card>
      {/* 스피너를 화면 위에 고정 */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="w-10 h-10 border-4 border-t-transparent border-black rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default SoundEditCard;
