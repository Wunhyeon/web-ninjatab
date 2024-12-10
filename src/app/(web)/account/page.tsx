import { CardSkeleton } from "@/components/premium/skeletons/card";
import { Subscriptions } from "@/components/premium/subscription/subscriptions";
import { buttonVariants } from "@/components/ui/button";
import { LOGIN_AGAIN } from "@/lib/constant";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";

const page = async () => {
  const supabase = createClient();
  const user = await supabase.auth.getUser();

  if (!user.data.user) {
    redirect(`/please-login?message=${LOGIN_AGAIN}`);
  }
  return (
    <div className="flex items-center justify-center">
      <div className="">
        <h3 className="text-3xl font-bold">Subscription Info</h3>
        <p className="text-zinc-500">Manage Your Subscription</p>
        <Link
          href="/account/subscription"
          className={cn(
            buttonVariants({ variant: "default" }),
            "justify-center mt-3"
          )}
        >
          Subscription Info
        </Link>
      </div>
    </div>
  );
};

export default page;
