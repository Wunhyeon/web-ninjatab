import PlanList from "@/components/premium/plans/PlanList";
import React, { Suspense } from "react";

const page = () => {
  return (
    <div>
      <Suspense fallback={<p>Loading plans...</p>}>
        <PlanList />
      </Suspense>
    </div>
  );
};

export default page;
