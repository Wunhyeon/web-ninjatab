"use client";

import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { sendGAEvent } from "@next/third-parties/google";
import { MAIN_GET_START } from "@/lib/GAEvent";

const GetStartBtn = () => {
  return (
    <Button
      className="w-fit"
      asChild
      onClick={() => {
        sendGAEvent("event", MAIN_GET_START.event, {
          value: MAIN_GET_START.value,
        });
      }}
    >
      <Link href="/my-timers">Get Started</Link>
    </Button>
  );
};

export default GetStartBtn;
