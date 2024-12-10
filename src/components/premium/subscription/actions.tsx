import { getOrderURLs, getSubscriptionURLs } from "@/action/lemonSqueezyAction";
import { type NewSubscription } from "@/lib/types";
import { SubscriptionActionsDropdown } from "./actions-dropdown";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Database } from "../../../lib/database.types";

export async function SubscriptionActions({
  subscription,
}: {
  subscription: Database["public"]["Tables"]["subscriptions"]["Row"];
}) {
  console.log("lemonSqueezyId : ", subscription.lemon_squeezy_id);

  const urls = await getSubscriptionURLs(subscription.lemon_squeezy_id);
  console.log("urls : ", urls);

  if (!urls) {
    return <></>;
  }

  if (
    subscription.status === "expired" ||
    subscription.status === "cancelled" ||
    subscription.status === "unpaid"
  ) {
    return (
      <Link
        href={urls.customer_portal}
        className={cn(buttonVariants({ variant: "outline" }))}
      >
        Customal Portal
      </Link>
    );
  }

  return (
    <SubscriptionActionsDropdown subscription={subscription} urls={urls} />
  );
}
