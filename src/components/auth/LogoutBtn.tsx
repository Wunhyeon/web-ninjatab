"use client";

import React from "react";
import { Button } from "../ui/button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";
import { NAV_LOGOUT } from "@/lib/GAEvent";

const LogoutBtn = () => {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };
  return (
    <div>
      <Button
        variant={"ghost"}
        className="items-center space-x-2 py-2 border border-transparent hover:text-slate-700  transition text-slate-400 hidden sm:flex"
        onClick={() => {
          handleLogout();

          sendGAEvent("event", NAV_LOGOUT.event, {
            value: NAV_LOGOUT.value,
          });
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
            d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
          />
        </svg>

        <span>Logout</span>
      </Button>
      <Button
        className="font-light sm:hidden p-0 h-full"
        variant={"ghost"}
        onClick={handleLogout}
      >
        Logout
      </Button>
    </div>
  );
};

export default LogoutBtn;
