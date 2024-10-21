import { getOrderURLs, getSubscriptionURLs } from "@/action/lemonSqueezyAction";
import { type NewSubscription } from "@/lib/types";
import {
  OrderActionsDropdown,
  SubscriptionActionsDropdown,
} from "./actions-dropdown";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Database } from "../../../../database.types";

export async function SubscriptionActions({
  subscription,
}: {
  subscription: NewSubscription;
}) {
  const urls = await getSubscriptionURLs(subscription.lemon_squeezy_id);
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

export async function OrderActions({
  order,
}: {
  order: Database["public"]["Tables"]["purchase"]["Row"];
}) {
  const urls = await getOrderURLs(order.lemon_squeezy_id);

  return <OrderActionsDropdown order={order} urls={urls} />;
}
