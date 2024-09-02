import { Button, buttonVariants } from "@/components/ui/button";
import { Client } from "@notionhq/client";
import Link from "next/link";
import React from "react";

const NotionConnectLink = () => {
  return (
    <Link
      className={buttonVariants({ variant: "outline" })}
      href={process.env.NOTION_AUTHORIZATION_URL!}
    >
      Notion Connect
    </Link>
  );
};

export default NotionConnectLink;
