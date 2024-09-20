import { getSubscriptionURLs } from "@/action/lemonSqueezyAction";
import { type NewSubscription } from "@/lib/types";
import { SubscriptionActionsDropdown } from "./actions-dropdown";

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
    return null;
  }

  const urls = await getSubscriptionURLs(subscription.lemon_squeezy_id);

  return (
    <SubscriptionActionsDropdown subscription={subscription} urls={urls} />
  );
}
