"use client";

import { Button, Loading } from "@lemonsqueezy/wedges";
import { CheckIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  forwardRef,
  useState,
  type ComponentProps,
  type ElementRef,
} from "react";
import { toast } from "sonner";
import { type NewPlan } from "@/lib/types";
import { changePlan, getCheckoutURL } from "@/action/lemonSqueezyAction";
import { sendGAEvent } from "@next/third-parties/google";
import { PREMIUM_SUBSCRIBE_BTN } from "@/lib/GAEvent";
import { LOGIN_AGAIN, surveyURL } from "@/lib/constant";
import { createClient } from "@/utils/supabase/client";

type ButtonElement = ElementRef<typeof Button>;
type ButtonProps = ComponentProps<typeof Button> & {
  embed?: boolean;
  isChangingPlans?: boolean;
  currentPlan?: NewPlan | null;
  plan: NewPlan;
};

export const SignupButton = forwardRef<ButtonElement, ButtonProps>(
  (props, ref) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const {
      embed = true,
      plan,
      currentPlan,
      isChangingPlans = false,
      ...otherProps
    } = props;

    let isCurrent = currentPlan && plan.id === currentPlan.id;
    const supabase = createClient();

    // eslint-disable-next-line no-nested-ternary -- allow
    const label = isCurrent
      ? "Your plan"
      : isChangingPlans
      ? "Switch to this plan"
      : "Subscribes";

    // eslint-disable-next-line no-nested-ternary -- disabled
    const before = loading ? (
      <Loading size="sm" className="size-4 dark" color="secondary" />
    ) : props.before ?? isCurrent ? (
      <CheckIcon className="size-4" />
    ) : (
      <PlusIcon className="size-4" />
    );

    return (
      <Button
        ref={ref}
        before={before}
        disabled={(loading || isCurrent) ?? props.disabled}
        // onClick={async () => {
        //   // If changing plans, call server action.
        //   if (isChangingPlans) {
        //     if (!currentPlan?.id) {
        //       throw new Error("Current plan not found.");
        //     }

        //     if (!plan.id) {
        //       throw new Error("New plan not found.");
        //     }

        //     setLoading(true);
        //     await changePlan(currentPlan.id, plan.id);
        //     setLoading(false);

        //     return;
        //   }

        //   // Otherwise, create a checkout and open the Lemon.js modal.
        //   let checkoutUrl: string | undefined = "";
        //   try {
        //     setLoading(true);
        //     checkoutUrl = await getCheckoutURL(plan.variant_id, embed);
        //   } catch (error) {
        //     setLoading(false);
        //     toast("Error creating a checkout.", {
        //       description:
        //         "Please check the server console for more information.",
        //     });
        //   } finally {
        //     embed && setLoading(false);
        //   }

        //   embed
        //     ? checkoutUrl && window.LemonSqueezy.Url.Open(checkoutUrl)
        //     : router.push(checkoutUrl ?? "/");

        //   sendGAEvent("event", PREMIUM_SUBSCRIBE_BTN.event, {
        //     value: PREMIUM_SUBSCRIBE_BTN.value,
        //   });
        // }}
        // {...otherProps}
        onClick={async () => {
          const user = await supabase.auth.getUser();
          if (!user.data.user) {
            router.push(`/please-login?message=${LOGIN_AGAIN}`);
            return;
          }
          window.open(surveyURL, "_blank");
        }}
      >
        {label}
      </Button>
    );
  }
);

SignupButton.displayName = "SignupButton";
