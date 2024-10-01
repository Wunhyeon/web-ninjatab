import { CardSkeleton } from "@/components/premium/skeletons/card";
import { Subscriptions } from "@/components/premium/subscription/subscriptions";
import React, { Suspense } from "react";

const page = () => {
  return (
    <Suspense fallback={<CardSkeleton className="h-[106px]" />}>
      <Subscriptions />
    </Suspense>
  );
};

export default page;
