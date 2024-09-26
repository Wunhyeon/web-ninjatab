"use client";
import { NEXT_PUBLIC_NOTION_AUTHORIZATION_URL } from "@/lib/constant";
import Link from "next/link";
import React, { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import NotionConnectSVG from "@/components/svg/NotionConnectSVG";
import { sendGAEvent } from "@next/third-parties/google";
import { CREATE_TIMER_CONNECT_WITH_NOTION } from "@/lib/GAEvent";

const NotionConnectLink = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const connectToNotion = async () => {
      const success = searchParams.get("success");

      if (success === "true") {
        window.opener?.postMessage("success", "*");
        // window.close();
      }
    };

    connectToNotion();
  }, [searchParams]);

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center">
      <div>
        <NotionConnectSVG className="w-80 h-36" />
      </div>
      <div className="mx-auto mt-4">
        <Link
          href={
            NEXT_PUBLIC_NOTION_AUTHORIZATION_URL
              ? NEXT_PUBLIC_NOTION_AUTHORIZATION_URL
              : "https://api.notion.com/v1/oauth/authorize?client_id=10bd872b-594c-8077-8ae1-0037e83bec16&response_type=code&owner=user&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback%2Fnotion"
          }
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "text-xl border-2 p-5 rounded-md"
          )}
          onClick={() => {
            sendGAEvent("event", CREATE_TIMER_CONNECT_WITH_NOTION.event, {
              value: CREATE_TIMER_CONNECT_WITH_NOTION.value,
            });
          }}
        >
          Connect with Notion
        </Link>
      </div>
    </div>
  );
};

const page = () => {
  return (
    <Suspense>
      <NotionConnectLink />
    </Suspense>
  );
};

export default page;
