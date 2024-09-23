"use client";
import { NOTION_AUTHORIZATION_URL } from "@/lib/constant";
import Link from "next/link";
import React, { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import NotionConnectSVG from "@/components/svg/NotionConnectSVG";

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

  console.log("NOTION_AUTHORIZATION_URL : ", NOTION_AUTHORIZATION_URL);

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center">
      <div>
        <NotionConnectSVG className="w-80 h-36" />
      </div>
      <div className="mx-auto mt-4">
        <Link
          href={
            NOTION_AUTHORIZATION_URL
              ? NOTION_AUTHORIZATION_URL
              : "https://api.notion.com/v1/oauth/authorize?client_id=9107fddb-ff77-47f7-98c9-e9cc68c19640&response_type=code&owner=user&redirect_uri=https%3A%2F%2Fwww.pomolog.site%2Fauth%2Fcallback%2Fnotion"
          }
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "text-xl border-2 p-5 rounded-md"
          )}
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
