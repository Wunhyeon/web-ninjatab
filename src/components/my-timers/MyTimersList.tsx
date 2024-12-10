"use client";

import Image from "next/image";
import { MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { cn } from "@/lib/utils";

import CreateTimerForm from "./CreateTimerForm";
import { redirect, useRouter } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";
import { MY_TIMER_CREATE_TIMER, MY_TIMER_EDIT_TIMER } from "@/lib/GAEvent";
import { toast } from "sonner";
import DeleteAlertDialog from "./DeleteAlertDialog";
import { useState } from "react";

export default function MyTimersList({
  data,
  isSubscribe,
}: {
  data: {
    id: string;
    name: string;
    notion_database_info: {
      id: string;
      database_id: string;
      database_name: string;
    }[];
  }[];
  isSubscribe: boolean;
}) {
  const router = useRouter();

  const handleCreateTimer = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    if (!isSubscribe && data.length > 0) {
      // 구독 안했을 때
      event.preventDefault();
      toast.info("Please Subscribe to create more timers!");
      return;
    }
    // redirect("/create-timer");
  };

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle>My Timers</CardTitle>
        <CardDescription>Manage your pomodoro timers.</CardDescription>
      </CardHeader>
      <div className="absolute top-3 right-3 flex gap-2">
        {/* <CreateTimerForm /> */}
        <Link
          className={buttonVariants({ variant: "outline" })}
          href="/create-timer"
          onClick={(e) => {
            sendGAEvent("event", MY_TIMER_CREATE_TIMER.event, {
              value: MY_TIMER_CREATE_TIMER.value,
            });
            handleCreateTimer(e);
          }}
        >
          Create Timer
        </Link>
      </div>

      <CardContent>
        <Table>
          <TableBody>
            {data.map((el, idx) => (
              <TableRow
                key={el.id}
                className="cursor-pointer"
                onClick={() => {
                  sendGAEvent("event", MY_TIMER_EDIT_TIMER.event, {
                    value: MY_TIMER_EDIT_TIMER.value,
                  });
                  router.push(`/edit-timer/${el.id}`);
                }}
              >
                <TableCell className="font-medium">{el.name}</TableCell>
                {/* <TableCell>
                  {el.notion_database_info.length &&
                  el.notion_database_info[0].database_name
                    ? el.notion_database_info[0].database_name
                    : "Not Connected Notion Database Yet"}
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        {/* <div className="text-xs text-muted-foreground">
          Showing <strong>1-10</strong> of <strong>32</strong> products
        </div> */}
      </CardFooter>
    </Card>
  );
}
