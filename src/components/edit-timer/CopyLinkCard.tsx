"use client";
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
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { ORIGIN } from "@/lib/constant";

const CopyLinkCard = ({
  timerId,
  databaseName,
}: {
  timerId: string;
  databaseName: string | null;
}) => {
  console.log("card - databaseName : ", databaseName);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Copy timer link</CardTitle>
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
        {databaseName ? (
          <div>
            Connected Database : <Button disabled>{databaseName}</Button>
          </div>
        ) : (
          "Not Connected Database"
        )}
        <div className="flex items-center space-x-2 w-full">
          <Input
            type="text"
            defaultValue={`${ORIGIN}/timer/${timerId}`}
            className=" flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-gray-600 dark:focus:ring-gray-600"
            disabled
          />
          <Button
            variant="outline"
            size="sm"
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            onClick={() => {
              //   navigator.clipboard.writeText("https://example.com");
            }}
          >
            {/* <CopyIcon className="h-4 w-4" /> */}
            <span>Copy</span>
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between"></CardFooter>
    </Card>
  );
};

export default CopyLinkCard;
