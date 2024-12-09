"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { sendGAEvent } from "@next/third-parties/google";
import { GOOGLE_LOGIN } from "@/lib/GAEvent";
import GoogleLoginBtnSVG from "@/lib/svgToTsx/GoogleLoginBtnSVG";

export function LoginForm() {
  const googleLogin = async () => {
    const supabase = createClient();
    const redirectPath = new URLSearchParams(window.location.search).get(
      "redirect"
    );
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // redirectTo: `${ORIGIN}/auth/callback/google`,
        redirectTo: `${process.env.NEXT_PUBLIC_ORIGIN}/auth/callback/google${
          redirectPath ? `?next=${encodeURIComponent(redirectPath)}` : ""
        }`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  };
  // console.log(
  //   "process.env.NEXT_PUBLIC_ORIGIN : ",
  //   process.env.NEXT_PUBLIC_ORIGIN
  // );

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Plase Login!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <Button
            variant={"ghost"}
            className="w-full relative h-full"
            onClick={() => {
              googleLogin();

              sendGAEvent("event", GOOGLE_LOGIN.event, {
                value: GOOGLE_LOGIN.value,
              });
            }}
          >
            {/* <Image src="/web_light_sq_ctn.svg" alt="google_login" fill /> */}
            <GoogleLoginBtnSVG />
          </Button>

          {/* <GoogleOneTapComponent /> */}
        </div>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="#" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
