"use server";

import { configureLemonSqueezy } from "@/config/lemonsqueezy";
import {
  ERROR_USER_NOT_AUTHORIZED,
  LIFE_TIME_DEAL,
  LOGIN_AGAIN,
} from "@/lib/constant";
import { webhookHasData, webhookHasMeta } from "@/lib/typeguards";
import { NewPlan, NewSubscription, NewWebhookEvent } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/serviceRoleServer";
import {
  cancelSubscription,
  createCheckout,
  getCustomer,
  getOrder,
  getOrderItem,
  getPrice,
  getProduct,
  getSubscription,
  lemonSqueezySetup,
  listPrices,
  listProducts,
  updateSubscription,
  Variant,
} from "@lemonsqueezy/lemonsqueezy.js";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import crypto, { randomUUID } from "node:crypto";
import { Database } from "../lib/database.types";

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

export const getAllPlan = async () => {
  const supabase = createClient();
  try {
    const planRes = await supabase.from("plans").select("*");
    if (planRes.error) {
      throw new Error();
    }
    return planRes.data;
  } catch (err) {}
};

/**
 * This action will sync the product variants from Lemon Squeezy with the
 * Plans database model. It will only sync the 'subscription' variants.
 */
async function _addVariant(
  variant: Database["public"]["Tables"]["plans"]["Insert"]
) {
  const supabase = createServiceRoleClient();
  try {
    // eslint-disable-next-line no-console -- allow
    console.log(`Syncing variant ${variant.name} with the database...`);

    // Sync the variant with the plan in the database.
    //   await db
    //     .insert(plans)
    //     .values(variant)
    //     .onConflictDoUpdate({ target: plans.variantId, set: variant });
    const { data, error } = await supabase
      .from("plans")
      .upsert(variant, { onConflict: "variant_id" });

    if (error) {
      // error handling
      console.log("err in _addVarint : ", error);

      throw new Error();
    }

    /* eslint-disable no-console -- allow */
    console.log(`${variant.name} synced with the database...`);

    // productVariants.push(variant);
  } catch (err) {
  } finally {
    return variant;
  }
}

export async function syncPlans() {
  const supabase = createServiceRoleClient();
  configureLemonSqueezy();

  try {
    // Fetch all the variants from the database.
    // const productVariants: NewPlan[] = await db.select().from(plans)
    const productVariantsResult = await supabase.from("plans").select("*");

    if (productVariantsResult.error || !productVariantsResult.data) {
      // error handling

      throw new Error();
      // return;
    }

    const productVariants: Database["public"]["Tables"]["plans"]["Insert"][] =
      productVariantsResult.data;

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
        // if (!isSubscription) {
        //   continue;
        // }

        const res = await _addVariant({
          name: variant.name,
          description: variant.description,
          price: priceString,
          interval: interval ? interval : null,
          interval_count:
            typeof intervalCount === "number" ? intervalCount : null,
          is_usage_based: isUsageBased,
          product_id: variant.product_id,
          product_name: productName,
          variant_id: parseInt(v.id) as unknown as number,
          trial_interval: trialInterval ? trialInterval : null,
          trial_interval_count:
            typeof trialIntervalCount === "number" ? trialIntervalCount : null,
          sort: variant.sort,
        });
        productVariants.push(res);
      }
    }
    return productVariants;
  } catch (err) {
    console.log("err in syncPlan : ", err);

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
        redirectUrl: `${process.env.NEXT_PUBLIC_ORIGIN}/premium/billing/success`,
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
      .upsert(
        {
          id: randomUUID(),
          event_name: eventName,
          processed: false,
          body,
        },
        { onConflict: "id", ignoreDuplicates: true }
      )
      .select();

    if (returnedValueRes.error) {
      console.log("storeWebhookEvent Error : ", returnedValueRes.error);

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

    // console.log("dbwebhookEventRes : ", dbwebhookEventRes);

    if (
      dbwebhookEventRes.error ||
      !dbwebhookEventRes.data ||
      dbwebhookEventRes.data.length < 1
    ) {
      throw new Error(
        `Webhook event #${webhookEvent.id} not found in the database. dbwebhookEventRes.error || !dbwebhookEventRes.data || dbwebhookEventRes.data.length < 1`
      );
    }

    if (!process.env.LEMONSQUEEZY_WEBHOOK_URL) {
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
          throw new Error(
            `err in processWebhookEvent - processingError : ${processingError}`
          );
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

          const updateData: Database["public"]["Tables"]["subscriptions"]["Insert"] =
            {
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

            const upsertRes = await supabase
              .from("subscriptions")
              .upsert(updateData, { onConflict: "lemon_squeezy_id" })
              .select("*");

            console.log("processWebhookEvent - upsertRes : ", upsertRes);

            if (upsertRes.error) {
              throw new Error(upsertRes.error.message);
            }
          } catch (error) {
            processingError = `Failed to upsert Subscription #${updateData.lemon_squeezy_id} to the database.`;
            console.error(error);
            throw new Error(
              `err in processWebhookEvent - processingError : ${processingError}`
            );
          }
        }
      } else if (webhookEvent.event_name.startsWith("order_")) {
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
  } catch (err) {
    console.log("err in processWebhookEvent : ", err);
    return new Error("err in  processWebhookEvent" + err);
  }
}

/**
 * This action will get the subscriptions for the current user.
 */
export async function getUserSubscriptions() {
  const supabase = createServiceRoleClient();
  const user = await getUser();

  if (!user) {
    notFound();
  }

  try {
    // const userSubscriptions: NewSubscription[] = await db
    //   .select()
    //   .from(subscriptions)
    //   .where(eq(subscriptions.userId, userId));

    const userSubscriptionsRes = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id);

    if (userSubscriptionsRes.error) {
      throw new Error();
    }

    const userSubscriptions: Database["public"]["Tables"]["subscriptions"]["Row"][] =
      userSubscriptionsRes.data;

    revalidatePath("/");

    return userSubscriptions;
  } catch (err) {
    console.log("err in getUserSubscriptions - ", err);
  }
}

/**
 * This action will get the subscriptions that not expired for the current user.
 */
export async function getUserSubscriptionsNotExpired() {
  const supabase = createServiceRoleClient();
  const user = await getUser();

  if (!user) {
    notFound();
  }

  try {
    // const userSubscriptions: NewSubscription[] = await db
    //   .select()
    //   .from(subscriptions)
    //   .where(eq(subscriptions.userId, userId));

    const userSubscriptionsRes = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "expired");

    if (userSubscriptionsRes.error) {
      throw new Error();
    }

    const userSubscriptions: Database["public"]["Tables"]["subscriptions"]["Row"][] =
      userSubscriptionsRes.data;

    revalidatePath("/");

    return userSubscriptions;
  } catch (err) {
    console.log("err in getUserSubscriptions - ", err);
  }
}

/**
 * This action will get the subscriptions that not expired for the user by user_id parameter.
 */
export async function getUserSubscriptionsNotExpiredByUserId(userId: string) {
  const supabase = createServiceRoleClient();

  try {
    // const userSubscriptions: NewSubscription[] = await db
    //   .select()
    //   .from(subscriptions)
    //   .where(eq(subscriptions.userId, userId));

    const userSubscriptionsRes = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .neq("status", "expired");

    if (userSubscriptionsRes.error) {
      throw new Error();
    }

    const userSubscriptions: Database["public"]["Tables"]["subscriptions"]["Row"][] =
      userSubscriptionsRes.data;

    revalidatePath("/");

    return userSubscriptions;
  } catch (err) {
    console.log("err in getUserSubscriptions - ", err);
  }
}

/**
 * This action will get the subscriptions for the current user.
 */
export async function getUserSubscriptionsNotExpiredByPlanId(planId: string) {
  const supabase = createServiceRoleClient();
  const serverSupabase = createClient();
  const user = await serverSupabase.auth.getUser();

  if (!user.data.user) {
    return undefined;
  }

  try {
    // const userSubscriptions: NewSubscription[] = await db
    //   .select()
    //   .from(subscriptions)
    //   .where(eq(subscriptions.userId, userId));

    const userSubscriptionsRes = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.data.user.id)
      .eq("plan_id", planId)
      .neq("status", "expired");

    if (userSubscriptionsRes.error) {
      throw new Error(userSubscriptionsRes.error.message);
    }

    const userSubscriptions: Database["public"]["Tables"]["subscriptions"]["Row"][] =
      userSubscriptionsRes.data;

    revalidatePath("/");

    return userSubscriptions;
  } catch (err) {
    console.log("err in getUserSubscriptionsNotExpiredByPlanId - ", err);
  }
}

/**
 * This action will get the subscription URLs (update_payment_method and
 * customer_portal) for the given subscription ID.
 *
 */
export async function getSubscriptionURLs(id: string) {
  try {
    configureLemonSqueezy();

    const apiKey = process.env.LEMONSQUEEZY_API_KEY; // 환경 변수에서 API 키를 가져옵니다.

    if (!apiKey) {
      throw new Error("API key is not set");
    }

    const subscription = await getSubscription(id);

    if (subscription.error) {
      throw new Error(subscription.error.message);
    }

    revalidatePath("/");

    return subscription.data.data.attributes.urls;
  } catch (err) {}
}

/**
 * This action will get the orders URLs (update_payment_method and
 * customer_portal) for the given order ID.
 *
 */
export async function getOrderURLs(id: string) {
  configureLemonSqueezy();

  const apiKey = process.env.LEMONSQUEEZY_API_KEY; // 환경 변수에서 API 키를 가져옵니다.

  if (!apiKey) {
    throw new Error("API key is not set");
  }
  try {
    const order = await getOrder(id);

    if (order.error) {
      throw new Error(order.error.message);
    }
    revalidatePath("/");

    return order.data.data.attributes.urls;
  } catch (err) {}
}

/**
 * This action will cancel a subscription on Lemon Squeezy.
 *  주의할점: DB 업데이트를 할 때 subscription 테이블의 id가 아니라 lemon_squeezy의 id임!!
 */
export async function cancelSub(id: string) {
  configureLemonSqueezy();

  // Get user subscriptions
  const userSubscriptions = await getUserSubscriptions();
  if (!userSubscriptions) {
    // error handling. user의 구독정보가 없는데 취소하려고 한거니깐.
    throw new Error();
  }

  // Check if the subscription exists
  const subscription = userSubscriptions.find(
    (sub) => sub.lemon_squeezy_id === id
  );

  if (!subscription) {
    throw new Error(`Subscription #${id} not found.`);
  }

  const cancelledSub = await cancelSubscription(id);

  if (cancelledSub.error) {
    throw new Error(cancelledSub.error.message);
  }

  const supabase = createServiceRoleClient();
  // Update the db
  try {
    // await db
    //   .update(subscriptions)
    //   .set({
    //     status: cancelledSub.data.data.attributes.status,
    //     statusFormatted: cancelledSub.data.data.attributes.status_formatted,
    //     endsAt: cancelledSub.data.data.attributes.ends_at,
    //   })
    //   .where(eq(subscriptions.lemonSqueezyId, id));

    const { error, data } = await supabase
      .from("subscriptions")
      .update({
        status: cancelledSub.data.data.attributes.status,
        status_formatted: cancelledSub.data.data.attributes.status_formatted,
        ends_at: cancelledSub.data.data.attributes.ends_at,
      })
      .eq("lemon_squeezy_id", id);
    if (error) {
      throw new Error();
    }
  } catch (error) {
    throw new Error(`Failed to cancel Subscription #${id} in the database.`);
  }

  revalidatePath("/");

  return cancelledSub;
}

/**
 * This action will pause a subscription on Lemon Squeezy.
 * 주의할점: DB 업데이트를 할 때 subscription 테이블의 id가 아니라 lemon_squeezy의 id임!!
 */
export async function pauseUserSubscription(id: string) {
  configureLemonSqueezy();

  // Get user subscriptions
  const userSubscriptions = await getUserSubscriptions();
  if (!userSubscriptions) {
    // error handling. user의 구독정보가 없는 상태.
    throw new Error();
  }

  // Check if the subscription exists
  const subscription = userSubscriptions.find(
    (sub) => sub.lemon_squeezy_id === id
  );

  if (!subscription) {
    throw new Error(`Subscription #${id} not found.`);
  }

  const date = new Date();
  date.setDate(date.getDate() + 7); // 7일 후 날짜 설정
  const resumeDate = date.toISOString(); // ISO 8601 형식으로 변환

  const returnedSub = await updateSubscription(id, {
    pause: {
      mode: "void",
      resumesAt: resumeDate,
    },
  });

  // Update the db
  const supabase = createServiceRoleClient();
  try {
    // await db
    //   .update(subscriptions)
    //   .set({
    //     status: returnedSub.data?.data.attributes.status,
    //     statusFormatted: returnedSub.data?.data.attributes.status_formatted,
    //     endsAt: returnedSub.data?.data.attributes.ends_at,
    //     isPaused: returnedSub.data?.data.attributes.pause !== null,
    //   })
    //   .where(eq(subscriptions.lemonSqueezyId, id));

    const { error, data } = await supabase
      .from("subscriptions")
      .update({
        status: returnedSub.data?.data.attributes.status,
        status_formatted: returnedSub.data?.data.attributes.status_formatted,
        ends_at: returnedSub.data?.data.attributes.ends_at,
        is_paused: returnedSub.data?.data.attributes.pause !== null,
      })
      .eq("lemon_squeezy_id", id);
    if (error) {
      throw new Error();
    }
  } catch (error) {
    throw new Error(`Failed to pause Subscription #${id} in the database.`);
  }

  revalidatePath("/");

  return returnedSub;
}

/**
 * This action will unpause a subscription on Lemon Squeezy.
 * 주의할점: DB 업데이트를 할 때 subscription 테이블의 id가 아니라 lemon_squeezy의 id임!!
 */
export async function unpauseUserSubscription(id: string) {
  configureLemonSqueezy();

  // Get user subscriptions
  const userSubscriptions = await getUserSubscriptions();
  if (!userSubscriptions) {
    // error handling. user의 구독정보가 없는 상태.
    throw new Error();
  }

  // Check if the subscription exists
  const subscription = userSubscriptions.find(
    (sub) => sub.lemon_squeezy_id === id
  );

  if (!subscription) {
    throw new Error(`Subscription #${id} not found.`);
  }

  const returnedSub = await updateSubscription(id, { pause: null });

  // Update the db
  const supabase = createServiceRoleClient();
  try {
    // await db
    //   .update(subscriptions)
    //   .set({
    //     status: returnedSub.data?.data.attributes.status,
    //     statusFormatted: returnedSub.data?.data.attributes.status_formatted,
    //     endsAt: returnedSub.data?.data.attributes.ends_at,
    //     isPaused: returnedSub.data?.data.attributes.pause !== null,
    //   })
    //   .where(eq(subscriptions.lemonSqueezyId, id));
    const { error, data } = await supabase
      .from("subscriptions")
      .update({
        status: returnedSub.data?.data.attributes.status,
        status_formatted: returnedSub.data?.data.attributes.status_formatted,
        ends_at: returnedSub.data?.data.attributes.ends_at,
        is_paused: returnedSub.data?.data.attributes.pause !== null,
      })
      .eq("lemon_squeezy_id", id);

    if (error) {
      throw new Error();
    }
  } catch (error) {
    throw new Error(`Failed to pause Subscription #${id} in the database.`);
  }

  revalidatePath("/");

  return returnedSub;
}

/**
 * This action will change the plan of a subscription on Lemon Squeezy.
 */
export async function changePlan(currentPlanId: string, newPlanId: string) {
  configureLemonSqueezy();

  const supabase = createServiceRoleClient();
  try {
    // Get user subscriptions
    const userSubscriptions = await getUserSubscriptions();
    if (!userSubscriptions) {
      throw new Error();
    }

    // Check if the subscription exists
    const subscription = userSubscriptions.find(
      (sub) => sub.plan_id === currentPlanId
    );

    if (!subscription) {
      throw new Error(
        `No subscription with plan id #${currentPlanId} was found.`
      );
    }

    // Get the new plan details from the database.
    // const newPlan = await db
    //   .select()
    //   .from(plans)
    //   .where(eq(plans.id, newPlanId))
    //   .then(takeUniqueOrThrow);
    const { data: newPlan, error } = await supabase
      .from("plans")
      .select("*")
      .eq("id", newPlanId)
      .single();

    if (error) {
      throw new Error("Plan not found");
    }

    // Send request to Lemon Squeezy to change the subscription.
    const updatedSub = await updateSubscription(subscription.lemon_squeezy_id, {
      variantId: newPlan.variant_id,
    });

    // Save in db
    try {
      // await db
      //   .update(subscriptions)
      //   .set({
      //     planId: newPlanId,
      //     price: newPlan.price,
      //     endsAt: updatedSub.data?.data.attributes.ends_at,
      //   })
      //   .where(eq(subscriptions.lemonSqueezyId, subscription.lemonSqueezyId));

      await supabase
        .from("subscriptions")
        .update({
          plan_id: newPlanId,
          price: newPlan.price,
          ends_at: updatedSub.data?.data.attributes.ends_at,
        })
        .eq("lemon_squeezy_id", subscription.lemon_squeezy_id);
    } catch (error) {
      throw new Error(
        `Failed to update Subscription #${subscription.lemon_squeezy_id} in the database.`
      );
    }

    revalidatePath("/");

    return updatedSub;
  } catch (err) {}
}
