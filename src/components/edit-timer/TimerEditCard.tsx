import React from "react";
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

const TimerEditCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timer</CardTitle>
        <CardDescription>Copy the Link for embed</CardDescription>
      </CardHeader>
      <CardContent>
        {/* <form>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Name of your project" />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="framework">Framework</Label>
                </div>
              </div>
            </form> */}
      </CardContent>
      <CardFooter className="flex justify-between"></CardFooter>
    </Card>
  );
};

export default TimerEditCard;
