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
import React from "react";
import { toast } from "sonner";

const EditTimerFrame = ({
  timerId,
  userNotionInfo,
}: {
  timerId: string;
  userNotionInfo: {
    id: string;
    workspace_name: string;
  }[];
}) => {
  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle>Edit Timer</CardTitle>
        <CardDescription>Manage your pomodoro timers.</CardDescription>
      </CardHeader>

      <CardContent>
        {/* notion */}
        <DatabaseInfo timerId={timerId} userNotionInfo={userNotionInfo} />
      </CardContent>
      <CardFooter>
        {/* <div className="text-xs text-muted-foreground">
          Showing <strong>1-10</strong> of <strong>32</strong> products
        </div> */}
      </CardFooter>
    </Card>
  );
};

export default EditTimerFrame;
