import { CardSkeleton } from "@/components/premium/skeletons/card";
import { Subscriptions } from "@/components/premium/subscription/subscriptions";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import React, { Suspense } from "react";

const page = () => {
  return (
    <div>
      <Link
        href="/setting/subscription"
        className={buttonVariants({ variant: "default" })}
      >
        Subscription
      </Link>
    </div>
  );
};

export default page;
