"use client";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import React from "react";
import { GUIDE_LINK } from "@/lib/constant";
import { sendGAEvent } from "@next/third-parties/google";
import {
  NAV_GUIDE,
  NAV_LOGIN,
  NAV_MY_TIMERS,
  NAV_PREMIUM,
  NAV_SETTING,
} from "@/lib/GAEvent";
import LogoutBtn from "../auth/LogoutBtn";

const MainNav = ({ user }: { user: User | undefined }) => {
  return (
    <nav className=" sm:flex mt-4 font-bold items-center justify-center space-x-8 overflow-auto no-scrollbar w-full">
      <Link href="/">
        {/* <Image src="/Frame-7.svg" alt="logo" height={30} width={200} /> */}
      </Link>
      <Link
        href="/my-timers"
        className="flex items-center space-x-2 py-2 border border-transparent hover:text-slate-700 dark:hover:text-slate-200 transition text-slate-400 dark:text-slate-500"
        onClick={() => {
          sendGAEvent("event", NAV_MY_TIMERS.event, {
            value: NAV_MY_TIMERS.value,
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
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>

        <span className="whitespace-nowrap">My Timers</span>
      </Link>

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

        <span>Pricing</span>
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
        href="/setting"
        className="flex items-center space-x-2 py-2 border border-transparent hover:text-slate-700  transition text-slate-400 "
        onClick={() => {
          sendGAEvent("event", NAV_SETTING.event, {
            value: NAV_SETTING.value,
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
            d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
            clipRule="evenodd"
          />
        </svg>

        <span>Setting</span>
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
    </nav>
  );
};

export default MainNav;
