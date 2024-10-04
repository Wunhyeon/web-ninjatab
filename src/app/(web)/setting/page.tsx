import { CardSkeleton } from "@/components/premium/skeletons/card";
import { Subscriptions } from "@/components/premium/subscription/subscriptions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { Suspense } from "react";

const page = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="">
        <h3 className="text-3xl font-bold">Subscription Info</h3>
        <p className="text-zinc-500">Manage Your Subscription</p>
        <Link
          href="/setting/subscription"
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
