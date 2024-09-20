// server component
import React from "react";
import Plan from "./Plan";
import { syncPlans } from "@/action/lemonSqueezyAction";
import { createClient } from "@/utils/supabase/server";
import { NewPlan } from "@/lib/types";
// server component
const PlanList = async () => {
  const supabase = createClient();
  // let allPlans: NewPlan[] = await db.select().from(plans)
  let planRes = await supabase.from("plans").select("*");
  if (planRes.error) {
    // error handling
    return;
  }
  let allPlans: NewPlan[] | null = planRes.data;

  // If there are no plans in the database, sync them from Lemon Squeezy.
  // You might want to add logic to sync plans periodically or a webhook handler.
  if (!allPlans || !allPlans.length) {
    const syncPlanRes = await syncPlans();
    if (!syncPlanRes) {
      // error handling
      return;
    }
    allPlans = syncPlanRes;
  }
  // plan 새로 생겼을때 이거 해주자.
  // const syncPlanRes = await syncPlans();
  // allPlans = syncPlanRes;
  // console.log("allPlan : ", allPlans);

  if (!allPlans || !allPlans.length) {
    return <p>No plans available.</p>;
  }

  return (
    <div>
      <h2>Plans</h2>

      <div className="mb-5 mt-3 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
        {allPlans.map((plan, index) => {
          return <Plan key={`plan-${index}`} plan={plan} />;
        })}
      </div>
    </div>
  );
};

export default PlanList;
