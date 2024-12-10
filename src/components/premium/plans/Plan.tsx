import { NewPlan } from "@/lib/types";
import React from "react";
// import { SignupButton } from "./SignupButton";
import { Section } from "../section";
import { cn, formatPrice } from "@/lib/utils";
import { SignupButton } from "./signup-button";
import { SearchXIcon } from "lucide-react";
import { Alert } from "@lemonsqueezy/wedges";
import Link from "next/link";
import { LEMON_SQUEEZY_LINK, LIFE_TIME_DEAL } from "@/lib/constant";
import { sendGAEvent } from "@next/third-parties/google";
import { PREMIUM_SUBSCRIBE_BTN } from "@/lib/GAEvent";
import { getUserSubscriptionsNotExpiredByPlanId } from "@/action/lemonSqueezyAction";

export const Plan = async ({
  plan,
  currentPlan = null,
  isChangingPlans = false,
}: {
  plan: NewPlan;
  currentPlan?: NewPlan | null;
  isChangingPlans?: boolean;
}) => {
  const { description, product_name, name, price, id, interval } = plan;
  let isCurrent = id && currentPlan?.id === id;

  const notExpiredPlan = await getUserSubscriptionsNotExpiredByPlanId(id!);
  // const userOrders = await getUserOrdersPaid(id!);

  if (notExpiredPlan && notExpiredPlan.length) {
    isCurrent = true;
    currentPlan = plan;
  }

  return (
    <Section className={cn("not-prose", isCurrent && "bg-surface-50/40")}>
      <Section.Item className="flex-col items-start gap-2">
        <header className="flex w-full items-center justify-between">
          {name ? (
            <h2 className="text-lg text-surface-900 font-bold">
              {product_name} ({name})
            </h2>
          ) : null}
        </header>
        {description ? (
          <div
            dangerouslySetInnerHTML={{
              // Ideally sanitize the description first
              __html: description,
            }}
            className="flex-col space-y-1 text-base"
          />
        ) : null}
      </Section.Item>

      <Section.Item className="flex-col items-start">
        <div className={cn(isCurrent && "opacity-60")}>
          <span className="mr-0.5 text-xl text-surface-900">
            {formatPrice(price)}
          </span>

          {plan.name
            .trim()
            .replaceAll(" ", "")
            .toLowerCase()
            .includes(LIFE_TIME_DEAL)
            ? ` Buy Once, Use Forever!`
            : !plan.is_usage_based && interval
            ? ` per ${interval}`
            : null}
          {plan.is_usage_based && interval ? ` /unit per ${interval}` : null}
        </div>
        {plan.price === "0" ? (
          <></>
        ) : (
          <div className="w-full">
            <SignupButton
              className="w-full"
              plan={plan}
              isChangingPlans={isChangingPlans}
              currentPlan={currentPlan}
            />
          </div>
        )}
      </Section.Item>
    </Section>
  );
};

export default Plan;

export function NoPlans() {
  return (
    <section className="prose mt-[10vw] flex flex-col items-center justify-center">
      <span className="flex size-24 items-center justify-center rounded-full bg-wg-red-50/70">
        <SearchXIcon
          className="text-wg-red"
          aria-hidden="true"
          size={48}
          strokeWidth={0.75}
        />
      </span>

      <p className="max-w-prose text-balance text-center leading-6 text-gray-500">
        There are no plans available at the moment.
      </p>
    </section>
  );
}

export function InfoMessage() {
  return (
    <Alert className="not-prose mt-2">
      Follow{" "}
      <a
        href="https://docs.lemonsqueezy.com/guides/developer-guide/testing-going-live#testing-the-checkout"
        target="_blank"
        className="text-gray-900 underline hover:text-primary"
      >
        these instructions
      </a>{" "}
      on how to do test payments with Lemon Squeezy.
    </Alert>
  );
}
