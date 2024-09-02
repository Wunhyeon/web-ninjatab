import { Button, buttonVariants } from "@/components/ui/button";
import { Client } from "@notionhq/client";
import Link from "next/link";
import React from "react";

const NotionConnectLink = ({ content }: { content: string }) => {
  return (
    <Link
      target="_blank"
      className={buttonVariants({ variant: "outline" })}
      href={process.env.NOTION_AUTHORIZATION_URL!}
    >
      {content}
    </Link>
  );
};

export default NotionConnectLink;
