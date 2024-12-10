"use client";

import { Button, DropdownMenu, Loading } from "@lemonsqueezy/wedges";
import { MoreVerticalIcon } from "lucide-react";
import { useState } from "react";
import { type NewSubscription } from "@/lib/types";
import {
  cancelSub,
  getOrderURLs,
  pauseUserSubscription,
  unpauseUserSubscription,
  type getSubscriptionURLs,
} from "@/action/lemonSqueezyAction";
import { LemonSqueezyModalLink } from "./modal-link";
import { toast } from "sonner";
import { Database } from "../../../lib/database.types";

export function SubscriptionActionsDropdown({
  subscription,
  urls,
}: {
  subscription: Database["public"]["Tables"]["subscriptions"]["Row"];
  urls: Awaited<ReturnType<typeof getSubscriptionURLs>>;
}) {
  const [loading, setLoading] = useState(false);

  if (
    subscription.status === "expired" ||
    subscription.status === "cancelled" ||
    subscription.status === "unpaid"
  ) {
    return null;
  }

  return (
    <>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-surface-50/50">
          <Loading size="sm" />
        </div>
      )}

      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button
            size="sm"
            variant="transparent"
            className="size-8 data-[state=open]:bg-surface-50"
            before={<MoreVerticalIcon className="size-4" />}
          />
        </DropdownMenu.Trigger>

        <DropdownMenu.Content side="bottom" className="z-10" align="end">
          <DropdownMenu.Group>
            {!subscription.is_paused && (
              <DropdownMenu.Item
                onClick={async () => {
                  setLoading(true);
                  await pauseUserSubscription(
                    subscription.lemon_squeezy_id
                  ).then(() => {
                    setLoading(false);
                    toast.info(
                      "The pause status will be lifted after 7 days, and the subscription will automatically resume."
                    );
                  });
                }}
              >
                Pause payments
              </DropdownMenu.Item>
            )}

            {subscription.is_paused && (
              <DropdownMenu.Item
                onClick={async () => {
                  setLoading(true);
                  await unpauseUserSubscription(
                    subscription.lemon_squeezy_id
                  ).then(() => {
                    setLoading(false);
                  });
                }}
              >
                Unpause payments
              </DropdownMenu.Item>
            )}

            <DropdownMenu.Item asChild>
              {urls ? (
                <a href={urls.customer_portal}>Customer portal ↗</a>
              ) : (
                <p>Please Try Again🙇‍♂️</p>
              )}
            </DropdownMenu.Item>

            {urls ? (
              <LemonSqueezyModalLink href={urls.update_payment_method}>
                Update payment method
              </LemonSqueezyModalLink>
            ) : (
              <p>Please Try Again🙇‍♂️</p>
            )}
          </DropdownMenu.Group>

          <DropdownMenu.Separator />

          <DropdownMenu.Group>
            <DropdownMenu.Item
              onClick={async () => {
                if (
                  // eslint-disable-next-line no-alert -- allow
                  confirm(
                    `Please confirm if you want to cancel your subscription.`
                  )
                ) {
                  setLoading(true);
                  await cancelSub(subscription.lemon_squeezy_id).then(() => {
                    setLoading(false);
                  });
                }
              }}
              destructive
            >
              Cancel subscription
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu>
    </>
  );
}
