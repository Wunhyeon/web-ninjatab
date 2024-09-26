"use client";

import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { GUIDE_LINK } from "@/lib/constant";
import { sendGAEvent } from "@next/third-parties/google";
import { MAIN_LEARN_MORE } from "@/lib/GAEvent";

const LearnMoreBtn = () => {
  return (
    <Button
      className="w-fit"
      variant="link"
      asChild
      onClick={() => {
        sendGAEvent("event", MAIN_LEARN_MORE.event, {
          value: MAIN_LEARN_MORE.value,
        });
      }}
    >
      <Link href={GUIDE_LINK} target="_blank">
        Learn More {"->"}
      </Link>
    </Button>
  );
};

export default LearnMoreBtn;
