import Maintenance from "@/components/Maintenance";
import { DashboardContent } from "@/components/premium/content";
import { PageTitleAction } from "@/components/premium/page-title-action";
import PlanList from "@/components/premium/plans/PlanList";
import { CardSkeleton } from "@/components/premium/skeletons/card";
import { PlansSkeleton } from "@/components/premium/skeletons/plans";
import { Subscriptions } from "@/components/premium/subscription/subscriptions";
import React, { Suspense } from "react";

// 공식홈페이지에서는 아래 주소로 되어있음. 나는 바꾼거.
/* src/app/dashboard/billing/page.tsx */

const page = () => {
  return (
    <div>
      <Suspense fallback={<PlansSkeleton />}>
        <PlanList />
      </Suspense>
    </div>
    // <Maintenance />
  );
};
export default page;
