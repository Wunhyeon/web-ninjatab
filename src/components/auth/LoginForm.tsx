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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import GoogleLoginBtnSVG from "../svg/GoogleLoginBtnSVG";
import { createClient } from "@/utils/supabase/client";
import { ORIGIN } from "@/lib/constant";

export function LoginForm() {
  const googleLogin = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${ORIGIN}/auth/callback/google`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  };

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
            onClick={googleLogin}
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
