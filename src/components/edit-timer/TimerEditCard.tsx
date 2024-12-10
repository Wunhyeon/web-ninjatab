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
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UpdateTimerTimeSchema } from "@/zodSchema/UpdateTimerTimeSchema";
import { toast } from "sonner";
import { updateTimerTime } from "@/action/timerAction";
import { sendGAEvent } from "@next/third-parties/google";
import { EDIT_TIMER_TIMER_UPDATE_BTN } from "@/lib/GAEvent";

const TimerEditCard = ({
  workTime,
  breakTime,
  timerId,
}: {
  workTime: number;
  breakTime: number;
  timerId: string;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isLoadingRef = useRef(false);

  function useReRenderer() {
    const [, setState] = useState({});
    return useCallback(() => setState({}), []);
  }
  const reRender = useReRenderer();

  const updateTimerTimeForm = useForm<z.infer<typeof UpdateTimerTimeSchema>>({
    resolver: zodResolver(UpdateTimerTimeSchema),
    defaultValues: {
      workTime,
      breakTime,
    },
  });

  async function onSubmit(data: z.infer<typeof UpdateTimerTimeSchema>) {
    // 따닥 방지하기!
    if (isLoadingRef.current) {
      return;
    }
    isLoadingRef.current = true;
    setIsLoading(true);
    reRender();
    const result = await updateTimerTime(
      timerId,
      data.workTime,
      data.breakTime
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
              stroke-width="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            &nbsp;Time Updated!
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
          <CardTitle>Timer</CardTitle>
          <CardDescription>Edit Timer</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...updateTimerTimeForm}>
            <form
              onSubmit={updateTimerTimeForm.handleSubmit(onSubmit)}
              className="space-y-8"
            >
              <div className="flex gap-6">
                <FormField
                  control={updateTimerTimeForm.control}
                  name="workTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work time (Minutes)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Please Input Work time"
                          {...field}
                          type="number"
                          min={1}
                          {...updateTimerTimeForm.register("workTime", {
                            valueAsNumber: true,
                          })}
                        />
                      </FormControl>
                      <FormDescription>Worktime 🔥</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateTimerTimeForm.control}
                  name="breakTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Break Time (Minutes)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Please Input Break Time"
                          {...field}
                          {...updateTimerTimeForm.register("breakTime", {
                            valueAsNumber: true,
                          })}
                          type="number"
                          min={1}
                        />
                      </FormControl>
                      <FormDescription>Break time 😌</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                disabled={isLoadingRef.current}
                onClick={() => {
                  sendGAEvent("event", EDIT_TIMER_TIMER_UPDATE_BTN.event, {
                    value: EDIT_TIMER_TIMER_UPDATE_BTN.value,
                  });
                }}
              >
                Update
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
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

export default TimerEditCard;
