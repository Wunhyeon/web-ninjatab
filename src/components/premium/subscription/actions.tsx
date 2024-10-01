import { getSubscriptionURLs } from "@/action/lemonSqueezyAction";
import { type NewSubscription } from "@/lib/types";
import { SubscriptionActionsDropdown } from "./actions-dropdown";
import Link from "next/link";

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
    return <Link href={urls.customer_portal}>Customal Portal</Link>;
  }

  const urls = await getSubscriptionURLs(subscription.lemon_squeezy_id);

  return (
    <SubscriptionActionsDropdown subscription={subscription} urls={urls} />
  );
}
