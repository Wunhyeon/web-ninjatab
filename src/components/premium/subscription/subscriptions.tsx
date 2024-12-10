/* /components/dashboard/billing/subscription/subscriptions.tsx */
// server component

import { Section } from "../section";
// import { ChangePlan } from "../plans/change-plan-button";
import { SubscriptionActions } from "./actions";
import { SubscriptionDate } from "./date";
import { SubscriptionPrice } from "./price";
import { SubscriptionStatus } from "./status";
import { type SubscriptionStatusType } from "@/lib/types";
import { cn, isValidSubscription } from "@/lib/utils";
import { getAllPlan, getUserSubscriptions } from "@/action/lemonSqueezyAction";
import { notFound } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Database } from "@/lib/database.types";

export async function Subscriptions() {
  const userSubscriptions = await getUserSubscriptions();
  const allPlans = await getAllPlan();

  if (!userSubscriptions) {
    // error handling
    // 제대로 처리가 됬다면 둘다 빈배열이라도 와야함.
    notFound();
  }
  if (!allPlans) {
    // error handling
    return;
  }

  if (userSubscriptions.length === 0) {
    return (
      <div>
        <p className="not-prose mb-2">
          It appears that you do not have any subscriptions.
        </p>
        <Link
          href="/premium"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Go to Subscribe
        </Link>
      </div>
    );
  }

  // Show active subscriptions first, then paused, then canceled
  const sortedSubscriptions = userSubscriptions.sort((a, b) => {
    if (a.status === "active" && b.status !== "active") {
      return -1;
    }

    if (a.status === "paused" && b.status === "cancelled") {
      return -1;
    }

    return 0;
  });

  return (
    <Section className="not-prose relative">
      {sortedSubscriptions.map(
        (
          subscription: Database["public"]["Tables"]["subscriptions"]["Row"],
          index: number
        ) => {
          const plan = allPlans.find((p) => p.id === subscription.plan_id);
          const status = subscription.status as SubscriptionStatusType;

          if (!plan) {
            throw new Error("Plan not found");
          }

          return (
            <Section.Item
              key={index}
              className="flex-col items-stretch justify-center gap-2"
            >
              <header className="flex items-center justify-between gap-3">
                <div className="min-h-8 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h2
                    className={cn(
                      "text-surface-900 text-lg",
                      !isValidSubscription(status) && "text-inherit"
                    )}
                  >
                    {plan.product_name} ({plan.name})
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {/* {isValidSubscription(status) && (
                    <ChangePlan planId={subscription.plan_id} />
                  )} */}

                  <SubscriptionActions subscription={subscription} />
                </div>
              </header>

              <div className="flex flex-wrap items-center gap-2">
                <SubscriptionPrice
                  endsAt={subscription.ends_at}
                  interval={plan.interval}
                  intervalCount={plan.interval_count}
                  price={subscription.price}
                  isUsageBased={plan.is_usage_based ?? false}
                />

                <SubscriptionStatus
                  status={status}
                  statusFormatted={subscription.status_formatted}
                  isPaused={Boolean(subscription.is_paused)}
                />

                <SubscriptionDate
                  endsAt={subscription.ends_at}
                  renewsAt={subscription.renews_at}
                  status={status}
                  trialEndsAt={subscription.trial_ends_at}
                />
              </div>
            </Section.Item>
          );
        }
      )}
    </Section>
  );
}
