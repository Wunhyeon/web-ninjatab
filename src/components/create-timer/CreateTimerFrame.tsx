import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import CreateTimerDatabase from "./CreateTimerDatabase";

const CreateTimerFrame = ({
  userNotionInfo,
  isSubscribe,
  isFirstTimerExist,
}: {
  userNotionInfo: { id: string; workspace_name: string }[];
  isSubscribe: boolean;
  isFirstTimerExist: boolean;
}) => {
  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle>Create Timer</CardTitle>
        <CardDescription>Create your pomodoro timers.</CardDescription>
      </CardHeader>

      <CardContent>
        {/* notion */}
        {/* <DatabaseInfo timerId={timerId} userNotionInfo={userNotionInfo} /> */}
        <CreateTimerDatabase
          userNotionInfo={userNotionInfo}
          isSubscribe
          isFirstTimerExist
        />
      </CardContent>
      <CardFooter>
        {/* <div className="text-xs text-muted-foreground">
          Showing <strong>1-10</strong> of <strong>32</strong> products
        </div> */}
      </CardFooter>
    </Card>
  );
};

export default CreateTimerFrame;
