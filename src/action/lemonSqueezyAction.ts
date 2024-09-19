"use server";

import { configureLemonSqueezy } from "@/config/lemonsqueezy";
import { NewPlan } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/serviceRoleServer";
import {
  cancelSubscription,
  getProduct,
  lemonSqueezySetup,
  listPrices,
  listProducts,
  updateSubscription,
  Variant,
} from "@lemonsqueezy/lemonsqueezy.js";

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
