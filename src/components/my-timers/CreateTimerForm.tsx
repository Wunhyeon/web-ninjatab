"use client";

import { CreateTimerSchema } from "@/zodSchema/CreateTimerSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Button, buttonVariants } from "../ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { insertNewTimer } from "@/action/timerAction";
import { toast } from "sonner";
import { Spinner } from "../Spinner";
import { useRouter } from "next/navigation";

const CreateTimerForm = () => {
  function useReRenderer() {
    const [, setState] = useState({});
    return useCallback(() => setState({}), []);
  }

  const isLoadingRef = useRef(false);
  const reRender = useReRenderer();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const timerForm = useForm<z.infer<typeof CreateTimerSchema>>({
    resolver: zodResolver(CreateTimerSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof CreateTimerSchema>) => {
    // 따닥방지.

    if (isLoadingRef.current) {
      return;
    }
    isLoadingRef.current = true;
    reRender();

    const res = await insertNewTimer(values.name);
    const parse: { success: boolean; err: unknown } = JSON.parse(res);
    if (!parse.success) {
      toast.error("Something Wrong");
    } else {
      toast.success("Timer Created!");
      router.refresh();
    }

    setIsOpen(false);
    isLoadingRef.current = false;
    reRender();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create Timer</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Timer</DialogTitle>
          <DialogDescription>
            Create Timer For Focus & Tracking!
          </DialogDescription>
        </DialogHeader>

        <Form {...timerForm}>
          <form
            className="space-y-2"
            onSubmit={timerForm.handleSubmit(onSubmit)}
          >
            <FormField
              control={timerForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="">Timer Name ⏰</FormLabel>
                  <FormControl id="first-name">
                    <Input {...field} />
                  </FormControl>
                  {/* <FormDescription></FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">
                {isLoadingRef.current ? <Spinner /> : "Create Timer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTimerForm;
