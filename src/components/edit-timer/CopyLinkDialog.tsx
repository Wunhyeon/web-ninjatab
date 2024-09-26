import React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ORIGIN } from "@/lib/constant";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { sendGAEvent } from "@next/third-parties/google";
import { COPY_HEATMAP, COPY_TIMER, EMBED_BTN } from "@/lib/GAEvent";

const CopyLinkDialog = ({
  timerId,
  databaseName,
}: {
  timerId: string;
  databaseName: string | null;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex gap-2 font-semibold"
          onClick={() => {
            sendGAEvent("event", EMBED_BTN.event, { value: EMBED_BTN.value });
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
            />
          </svg>
          Embed
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Embed Link</DialogTitle>
          <DialogDescription>
            Copy the Link And Embed Your Notion.
          </DialogDescription>
        </DialogHeader>
        {databaseName ? (
          <div>
            Database :{" "}
            <Badge className="text-lg rounded-md pointer-events-none">
              {databaseName}
            </Badge>
          </div>
        ) : (
          "Not Connected Database"
        )}

        <div className="flex items-center space-x-2 w-full gap-2">
          Timer
          <Input
            type="text"
            defaultValue={`${ORIGIN}/widget/timer/${timerId}`}
            className=" flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-gray-600 dark:focus:ring-gray-600 text-ellipsis"
            readOnly
          />
          <CopyToClipboard
            text={`${ORIGIN}/widget/timer/${timerId}`}
            onCopy={() => {
              toast.info("coppied!");
              sendGAEvent("event", COPY_TIMER.event, {
                value: COPY_TIMER.value,
              });
            }}
          >
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
          </CopyToClipboard>
        </div>
        <div className="flex items-center space-x-2 w-full gap-2">
          Heat Map
          <Input
            type="text"
            defaultValue={`${ORIGIN}/widget/heatmap/${timerId}`}
            className=" flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-gray-600 dark:focus:ring-gray-600 text-ellipsis"
            readOnly
          />
          <CopyToClipboard
            text={`${ORIGIN}/widget/heatmap/${timerId}`}
            onCopy={() => {
              toast.info("coppied!");
              sendGAEvent("event", COPY_HEATMAP.event, {
                value: COPY_HEATMAP.value,
              });
            }}
          >
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
          </CopyToClipboard>
        </div>

        <DialogFooter>
          {/* <Button type="submit">Save changes</Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CopyLinkDialog;
