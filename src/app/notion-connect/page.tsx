"use client";
import { NOTION_AUTHORIZATION_URL } from "@/lib/constant";
import Link from "next/link";
import React, { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const NotionConnectLink = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const connectToNotion = async () => {
      const success = searchParams.get("success");
      alert(`@@@@@@@ notion-connect page 0 success : ${success}`);

      if (success === "true") {
        window.opener?.postMessage("success", "*");
        // window.close();
      }
    };

    connectToNotion();
  }, [searchParams]);

  return (
    <div>
      <Link href={NOTION_AUTHORIZATION_URL}>NotionConnect</Link>
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
