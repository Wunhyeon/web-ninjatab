"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Loading } from "@lemonsqueezy/wedges";
// import { getCheckoutURL } from '@/app/actions'
import { NewPlan } from "@/lib/types";
import { toast } from "sonner";
import { getCheckoutURL } from "@/action/lemonSqueezyAction";

export function SignupButton(props: {
  plan: NewPlan;
  currentPlan?: NewPlan;
  embed?: boolean;
}) {
  const { plan, currentPlan, embed = true } = props;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isCurrent = plan.id === currentPlan?.id;

  const label = isCurrent ? "Your plan" : "Sign up";

  // Make sure Lemon.js is loaded, you need to enqueue the Lemon Squeezy SDK in your app first.
  useEffect(() => {
    console.log("useEffect - out : ", typeof window.createLemonSqueezy);
    console.log("useEffect - out - typeof window : ", typeof window);

    if (typeof window.createLemonSqueezy === "function") {
      console.log(
        "IN - typeof window.createLemonSqueezy  : ",
        typeof window.createLemonSqueezy
      );

      window.createLemonSqueezy();
    }
  }, []);

  return (
    <Button
      //   before={loading ? <Loading /> : null}
      disabled={loading || isCurrent}
      onClick={async () => {
        // Create a checkout and open the Lemon.js modal
        let checkoutUrl: string | undefined = "";

        try {
          setLoading(true);
          checkoutUrl = await getCheckoutURL(plan.variant_id, embed);
        } catch (error) {
          setLoading(false);
          toast("Error creating a checkout.", {
            description:
              "Please check the server console for more information.",
          });
        } finally {
          embed && setLoading(false);
        }

        embed
          ? checkoutUrl && window.LemonSqueezy.Url.Open(checkoutUrl)
          : router.push(checkoutUrl ?? "/");
      }}
    >
      {label}
    </Button>
  );
}
