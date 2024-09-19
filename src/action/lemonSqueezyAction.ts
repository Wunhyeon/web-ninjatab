"use server";

import { configureLemonSqueezy } from "@/config/lemonsqueezy";
import { ERROR_USER_NOT_AUTHORIZED, LOGIN_AGAIN } from "@/lib/constant";
import { webhookHasData, webhookHasMeta } from "@/lib/typeguards";
import { NewPlan, NewSubscription, NewWebhookEvent } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/serviceRoleServer";
import {
  cancelSubscription,
  createCheckout,
  getPrice,
  getProduct,
  lemonSqueezySetup,
  listPrices,
  listProducts,
  updateSubscription,
  Variant,
} from "@lemonsqueezy/lemonsqueezy.js";
import { redirect } from "next/navigation";
import crypto, { randomUUID } from "node:crypto";

/**
 * getUser. 유저 객체를 돌려준다. 유저 객체가 없으면 please-login page로 리다이렉트 시킨다.
 * serverAction안에서만 쓸 것
 * @returns user.data.user
 */
const getUser = async () => {
  const supabase = createClient();

  try {
    const user = await supabase.auth.getUser();

    if (!user.data.user) {
      throw new Error(
        JSON.stringify({ statusCode: 401, title: ERROR_USER_NOT_AUTHORIZED })
      );
    }

    return user.data.user;
  } catch (err) {
    redirect(`/please-login?message=${LOGIN_AGAIN}`);
  }
};

/**
 * This action will sync the product variants from Lemon Squeezy with the
 * Plans database model. It will only sync the 'subscription' variants.
 */
async function _addVariant(variant: NewPlan) {
  const supabase = createServiceRoleClient();
  try {
    // eslint-disable-next-line no-console -- allow
    console.log(`Syncing variant ${variant.name} with the database...`);

    // Sync the variant with the plan in the database.
    //   await db
    //     .insert(plans)
    //     .values(variant)
    //     .onConflictDoUpdate({ target: plans.variantId, set: variant });
    const { data, error } = await supabase.from("plans").upsert(variant);

    console.log("data : ", data);
    console.log("error  : ", error);

    /* eslint-disable no-console -- allow */
    console.log(`${variant.name} synced with the database...`);

    // productVariants.push(variant);
  } catch (err) {
  } finally {
    return variant;
  }
}

export async function syncPlans() {
  const supabase = createClient();
  configureLemonSqueezy();

  try {
    // Fetch all the variants from the database.
    // const productVariants: NewPlan[] = await db.select().from(plans)
    const productVariantsResult = await supabase.from("plans").select("*");

    if (productVariantsResult.error || !productVariantsResult.data) {
      // error handling

      return;
    }
    const productVariants: NewPlan[] = productVariantsResult.data;

    // Helper function to add a variant to the productVariants array and sync it with the database.

    // Fetch products from the Lemon Squeezy store.
    const products = await listProducts({
      filter: { storeId: process.env.LEMONSQUEEZY_STORE_ID },
      include: ["variants"],
    });

    // Loop through all the variants.
    const allVariants = products.data?.included as
      | Variant["data"][]
      | undefined;

    // for...of supports asynchronous operations, unlike forEach.
    if (allVariants) {
      /* eslint-disable no-await-in-loop -- allow */
      for (const v of allVariants) {
        const variant = v.attributes;

        // Skip draft variants or if there's more than one variant, skip the default
        // variant. See https://docs.lemonsqueezy.com/api/variants
        if (
          variant.status === "draft" ||
          (allVariants.length !== 1 && variant.status === "pending")
        ) {
          // `return` exits the function entirely, not just the current iteration.
          // so use `continue` instead.
          continue;
        }

        // Fetch the Product name.
        const productName =
          (await getProduct(variant.product_id)).data?.data.attributes.name ??
          "";

        // Fetch the Price object.
        const variantPriceObject = await listPrices({
          filter: {
            variantId: v.id,
          },
        });

        const currentPriceObj = variantPriceObject.data?.data.at(0);
        const isUsageBased =
          currentPriceObj?.attributes.usage_aggregation !== null;
        const interval = currentPriceObj?.attributes.renewal_interval_unit;
        const intervalCount =
          currentPriceObj?.attributes.renewal_interval_quantity;
        const trialInterval = currentPriceObj?.attributes.trial_interval_unit;
        const trialIntervalCount =
          currentPriceObj?.attributes.trial_interval_quantity;

        const price = isUsageBased
          ? currentPriceObj?.attributes.unit_price_decimal
          : currentPriceObj.attributes.unit_price;

        const priceString = price !== null ? price?.toString() ?? "" : "";

        const isSubscription =
          currentPriceObj?.attributes.category === "subscription";

        // If not a subscription, skip it.
        if (!isSubscription) {
          continue;
        }
        console.log("priceString : ", priceString);

        const res = await _addVariant({
          name: variant.name,
          description: variant.description,
          price: priceString,
          interval,
          interval_count: intervalCount,
          is_usage_based: isUsageBased,
          product_id: variant.product_id,
          product_name: productName,
          variant_id: parseInt(v.id) as unknown as number,
          trial_interval: trialInterval,
          trial_interval_count: trialIntervalCount,
          sort: variant.sort,
        });
        productVariants.push(res);
      }
    }
    return productVariants;
  } catch (err) {
    return null;
  }
}

/**
 * This action will create a checkout on Lemon Squeezy.
 */
export async function getCheckoutURL(variantId: number, embed = false) {
  configureLemonSqueezy();

  // const session = await auth()

  // if (!session?.user) {
  //   throw new Error('User is not authenticated.')
  // }
  const user = await getUser();

  // import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js'
  const checkout = await createCheckout(
    process.env.LEMONSQUEEZY_STORE_ID!,
    variantId,
    {
      checkoutOptions: {
        embed,
        media: false,
        logo: !embed,
      },
      checkoutData: {
        email: user.email ?? undefined,
        custom: {
          user_id: user.id,
        },
      },
      productOptions: {
        enabledVariants: [variantId],
        redirectUrl: `${process.env.ORIGIN}/billing/`,
        receiptButtonText: "Go to Dashboard",
        receiptThankYouNote: "Thank you for signing up to Lemon Stand!",
      },
    }
  );

  return checkout.data?.data.attributes.url;
}

/**
 * This action will store a webhook event in the database.
 * @param eventName - The name of the event.
 * @param body - The body of the event.
 */
export async function storeWebhookEvent(
  eventName: string,
  body: NewWebhookEvent["body"]
) {
  // if (!process.env.POSTGRES_URL) {
  //   throw new Error("POSTGRES_URL is not set");
  // }

  const supabase = createServiceRoleClient();
  try {
    const id = crypto.randomInt(100000000, 1000000000);

    // const returnedValue = await db
    //   .insert(webhookEvents)
    //   .values({
    //     id,
    //     eventName,
    //     processed: false,
    //     body,
    //   })
    //   .onConflictDoNothing({ target: plans.id })
    //   .returning();

    const returnedValueRes = await supabase
      .from("webhook_event")
      .upsert({
        id: randomUUID(),
        event_name: eventName,
        processed: false,
        body,
      })
      .select();

    if (returnedValueRes.error) {
      throw new Error();
    }

    // return returnedValue[0];
    return returnedValueRes.data[0];
  } catch (err) {}
}

/**
 * This action will process a webhook event in the database.
 */
export async function processWebhookEvent(webhookEvent: NewWebhookEvent) {
  configureLemonSqueezy();
  const supabase = createServiceRoleClient();
  try {
    // const dbwebhookEvent = await db
    //   .select()
    //   .from(webhookEvents)
    //   .where(eq(webhookEvents.id, webhookEvent.id));

    const dbwebhookEventRes = await supabase
      .from("webhook_event")
      .select("*")
      .eq("id", webhookEvent.id);

    if (
      dbwebhookEventRes.error ||
      !dbwebhookEventRes.data ||
      dbwebhookEventRes.data.length < 1
    ) {
      throw new Error(
        `Webhook event #${webhookEvent.id} not found in the database.`
      );
    }

    if (!process.env.WEBHOOK_URL) {
      throw new Error(
        "Missing required WEBHOOK_URL env variable. Please, set it in your .env file."
      );
    }

    let processingError = "";
    const eventBody = webhookEvent.body;

    if (!webhookHasMeta(eventBody)) {
      processingError = "Event body is missing the 'meta' property.";
    } else if (webhookHasData(eventBody)) {
      if (webhookEvent.event_name.startsWith("subscription_payment_")) {
        // Save subscription invoices; eventBody is a SubscriptionInvoice
        // Not implemented.
      } else if (webhookEvent.event_name.startsWith("subscription_")) {
        // Save subscription events; obj is a Subscription
        const attributes = eventBody.data.attributes;
        const variantId = attributes.variant_id as string;

        // We assume that the Plan table is up to date.
        // const plan = await db
        //   .select()
        //   .from(plans)
        //   .where(eq(plans.variantId, parseInt(variantId, 10)));

        const planRes = await supabase
          .from("plans")
          .select("*")
          .eq("variant_id", parseInt(variantId, 10));

        if (planRes.error || !planRes.data || planRes.data.length < 1) {
          processingError = `Plan with variantId ${variantId} not found.`;
        } else {
          // Update the subscription in the database.

          const priceId = attributes.first_subscription_item.price_id;

          // Get the price data from Lemon Squeezy.
          const priceData = await getPrice(priceId);
          if (priceData.error) {
            processingError = `Failed to get the price data for the subscription ${eventBody.data.id}.`;
          }

          const isUsageBased =
            attributes.first_subscription_item.is_usage_based;
          const price = isUsageBased
            ? priceData.data?.data.attributes.unit_price_decimal
            : priceData.data?.data.attributes.unit_price;

          const updateData: NewSubscription = {
            lemon_squeezy_id: eventBody.data.id,
            order_id: attributes.order_id as number,
            name: attributes.user_name as string,
            email: attributes.user_email as string,
            status: attributes.status as string,
            status_formatted: attributes.status_formatted as string,
            renews_at: attributes.renews_at as string,
            ends_at: attributes.ends_at as string,
            trial_ends_at: attributes.trial_ends_at as string,
            price: price?.toString() ?? "",
            is_paused: false,
            subscription_item_id: attributes.first_subscription_item.id,
            is_usage_based: attributes.first_subscription_item.is_usage_based,
            user_id: eventBody.meta.custom_data.user_id,
            plan_id: planRes.data[0].id,
          };

          // Create/update subscription in the database.
          try {
            // await db
            //   .insert(subscriptions)
            //   .values(updateData)
            //   .onConflictDoUpdate({
            //     target: subscriptions.lemonSqueezyId,
            //     set: updateData,
            //   });

            const insertRes = await supabase
              .from("subscription")
              .upsert(updateData);

            if (insertRes.error) {
              throw new Error();
            }
          } catch (error) {
            processingError = `Failed to upsert Subscription #${updateData.lemon_squeezy_id} to the database.`;
            console.error(error);
          }
        }
      } else if (webhookEvent.event_name.startsWith("order_")) {
        // Save orders; eventBody is a "Order"
        /* Not implemented */
      } else if (webhookEvent.event_name.startsWith("license_")) {
        // Save license keys; eventBody is a "License key"
        /* Not implemented */
      }

      // Update the webhook event in the database.
      // await db
      //   .update(webhookEvents)
      //   .set({
      //     processed: true,
      //     processingError,
      //   })
      //   .where(eq(webhookEvents.id, webhookEvent.id));

      await supabase
        .from("webhook_event")
        .update({ processed: true, processing_error: processingError })
        .eq("id", webhookEvent.id);
    }
  } catch (err) {}
}
