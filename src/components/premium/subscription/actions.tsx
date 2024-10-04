import { getSubscriptionURLs } from "@/action/lemonSqueezyAction";
import { type NewSubscription } from "@/lib/types";
import { SubscriptionActionsDropdown } from "./actions-dropdown";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export async function SubscriptionActions({
  subscription,
}: {
  subscription: NewSubscription;
}) {
  if (
    subscription.status === "expired" ||
    subscription.status === "cancelled" ||
    subscription.status === "unpaid"
  ) {
    const urls = await getSubscriptionURLs(subscription.lemon_squeezy_id);
    return (
      <Link
        href={urls.customer_portal}
        className={cn(buttonVariants({ variant: "outline" }))}
      >
        Customal Portal
      </Link>
    );
  }

  const urls = await getSubscriptionURLs(subscription.lemon_squeezy_id);

  return (
    <SubscriptionActionsDropdown subscription={subscription} urls={urls} />
  );
}
