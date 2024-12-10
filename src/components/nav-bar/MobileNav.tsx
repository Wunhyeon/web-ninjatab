import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button, buttonVariants } from "../ui/button";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "../ui/menubar";
import { cn } from "@/lib/utils";
import { User } from "@supabase/supabase-js";
import LogoutBtn from "./LogoutBtn";
import { createClient } from "@/utils/supabase/server";
import { GUIDE_LINK } from "@/lib/constant";

const MobileNav = async ({ user }: { user: User | undefined }) => {
  return (
    <nav className="relative flex sm:hidden items-center space-x-2 py-4 px-2 lg:px-0 mx-auto w-full max-w-[1000px]">
      <Link href="/">
        <Image src="/Frame-7.svg" alt="logo" height={30} width={200} />
      </Link>
      <div className="flex-grow"></div>
      {user ? (
        <></>
      ) : (
        <Link
          href="sign-in"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "font-extrabold"
          )}
        >
          Sign In
        </Link>
      )}

      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
            >
              <path
                fillRule="evenodd"
                d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
                clipRule="evenodd"
              />
            </svg>
          </MenubarTrigger>
          <MenubarContent className="space-y-2">
            {/* My Timers */}
            <Link
              href="/my-timers"
              className="flex items-center space-x-2  border border-transparent hover:text-slate-700  transition "
            >
              <MenubarItem>
                ⏰ My Timers
                {/* <MenubarShortcut>⏰</MenubarShortcut> */}
              </MenubarItem>
            </Link>
            {/* Pricing */}
            <Link
              href="/premium"
              className="flex items-center space-x-2  border border-transparent hover:text-slate-700  transition "
            >
              <MenubarItem>
                ⭐️ Pricing
                {/* <MenubarShortcut>⭐️</MenubarShortcut> */}
              </MenubarItem>
            </Link>
            {/* Guide */}
            <Link
              href={GUIDE_LINK}
              className="flex items-center space-x-2  border border-transparent hover:text-slate-700  transition "
              target="_blank"
            >
              <MenubarItem>
                📖 Guide
                {/* <MenubarShortcut>📖</MenubarShortcut> */}
              </MenubarItem>
            </Link>
            {/* Setting */}
            <Link
              href="/setting"
              className="flex items-center space-x-2  border border-transparent hover:text-slate-700  transition "
            >
              <MenubarItem>
                ⚙️ Setting
                {/* <MenubarShortcut>⚙️</MenubarShortcut> */}
              </MenubarItem>
            </Link>
            {/* <MenubarSeparator /> */}
            {/* <MenubarItem>Share</MenubarItem> */}
            {user ? (
              <div>
                <MenubarSeparator />
                <MenubarItem>
                  <LogoutBtn />
                </MenubarItem>
              </div>
            ) : (
              <></>
            )}
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </nav>
  );
};

export default MobileNav;
