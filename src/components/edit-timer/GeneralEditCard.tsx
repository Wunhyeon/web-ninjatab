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
import DeleteAlertDialog from "../my-timers/DeleteAlertDialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { UpdateTimerNameSchema } from "@/zodSchema/UpdateTimerNameSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";
import { sendGAEvent } from "@next/third-parties/google";
import { toast } from "sonner";
import { updateTimerName } from "@/action/timerAction";

const GeneralEditCard = ({
  timerId,
  timerName,
  setTimerName,
}: {
  timerId: string;
  timerName: string;
  setTimerName: (name: string) => void;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isLoadingRef = useRef(false);

  function useReRenderer() {
    const [, setState] = useState({});
    return useCallback(() => setState({}), []);
  }
  const reRender = useReRenderer();

  const updateTimerNameForm = useForm<z.infer<typeof UpdateTimerNameSchema>>({
    resolver: zodResolver(UpdateTimerNameSchema),
    defaultValues: {
      name: timerName,
    },
  });

  async function onSubmit(data: z.infer<typeof UpdateTimerNameSchema>) {
    // 따닥 방지하기!
    if (isLoadingRef.current) {
      return;
    }
    isLoadingRef.current = true;
    setIsLoading(true);
    reRender();
    const result = await updateTimerName(timerId, data.name);

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
            &nbsp;Name Updated!
          </strong>
        </div>,
        {
          closeButton: true,
          richColors: true,
          style: { background: "#EDFDF3" },
        }
      );
      setTimerName(data.name);
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
          <CardTitle>General</CardTitle>
          <CardDescription>
            We are in preparation and continuously updating. Thank you 🤗
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            {/* <h4 className="text-lg font-semibold">Rename</h4>
            <Input
              value={timerName}
              onChange={(e) => {
                setName(e.target.value);
              }}
            /> */}
            <Form {...updateTimerNameForm}>
              <form
                onSubmit={updateTimerNameForm.handleSubmit(onSubmit)}
                className="space-y-3"
              >
                <div className="">
                  <FormField
                    control={updateTimerNameForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold">
                          Rename
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Rename" {...field} />
                        </FormControl>
                        <FormDescription></FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoadingRef.current}
                  onClick={() => {
                    // sendGAEvent("event", EDIT_TIMER_TIMER_UPDATE_BTN.event, {
                    //   value: EDIT_TIMER_TIMER_UPDATE_BTN.value,
                    // });
                  }}
                >
                  Update
                </Button>
              </form>
            </Form>
          </div>
          <Separator className="my-3" />
          <div className="space-y-3">
            <h4 className="text-lg font-semibold">⚠️ Caution</h4>
            <DeleteAlertDialog timerId={timerId} setIsLoading={setIsLoading} />
          </div>
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

export default GeneralEditCard;
