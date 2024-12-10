"use client";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import LogoutBtn from "./LogoutBtn";
import { createClient } from "@/utils/supabase/server";
import { GUIDE_LINK } from "@/lib/constant";
import { sendGAEvent } from "@next/third-parties/google";
import {
  NAV_GUIDE,
  NAV_LOGIN,
  NAV_MY_TIMERS,
  NAV_PREMIUM,
  NAV_SETTING,
} from "@/lib/GAEvent";

const MainNav = ({ user }: { user: User | undefined }) => {
  return (
    <nav className="hidden sm:flex mt-4 font-bold items-center justify-around space-x-8 overflow-auto no-scrollbar w-full">
      <div>
        <Link href="/">
          <h1 className="text-3xl">🥷 Ninja Tab</h1>
        </Link>
      </div>
      <div className="flex justify-around gap-5">
        <Link
          href="/premium"
          // href="#"
          className="flex items-center space-x-2 py-2 border border-transparent hover:text-slate-700 dark:hover:text-slate-200 transition text-slate-400 dark:text-slate-500"
          onClick={() => {
            sendGAEvent("event", NAV_PREMIUM.event, {
              value: NAV_PREMIUM.value,
            });
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-6"
          >
            <path
              fillRule="evenodd"
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
              clipRule="evenodd"
            />
          </svg>

          <span>Premium</span>
        </Link>
        <Link
          href={GUIDE_LINK}
          className="flex items-center space-x-2 py-2 border border-transparent hover:text-slate-700  transition text-slate-400 "
          target="_blank"
          onClick={() => {
            sendGAEvent("event", NAV_GUIDE.event, {
              value: NAV_GUIDE.value,
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
              d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
            />
          </svg>

          <span>Guide</span>
        </Link>

        <Link
          href="/account"
          className="flex items-center space-x-2 py-2 border border-transparent hover:text-slate-700  transition text-slate-400 "
          onClick={() => {
            sendGAEvent("event", NAV_SETTING.event, {
              value: NAV_SETTING.value,
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
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>

          <span>Account</span>
        </Link>
        {user ? (
          <LogoutBtn />
        ) : (
          <Link
            href="/sign-in"
            className="flex items-center space-x-2 py-2 border border-transparent hover:text-slate-700 dark:hover:text-slate-200 transition text-slate-400 dark:text-slate-500"
            onClick={() => {
              sendGAEvent("event", NAV_LOGIN.event, {
                value: NAV_LOGIN.value,
              });
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
            >
              <path
                fillRule="evenodd"
                d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6Zm-5.03 4.72a.75.75 0 0 0 0 1.06l1.72 1.72H2.25a.75.75 0 0 0 0 1.5h10.94l-1.72 1.72a.75.75 0 1 0 1.06 1.06l3-3a.75.75 0 0 0 0-1.06l-3-3a.75.75 0 0 0-1.06 0Z"
                clipRule="evenodd"
              />
            </svg>

            <span>Sign In</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default MainNav;
