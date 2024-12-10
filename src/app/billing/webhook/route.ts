/* src/app/api/webhook/route.ts */
import crypto from "node:crypto";
import { webhookHasMeta } from "@/lib/typeguards";
import {
  processWebhookEvent,
  storeWebhookEvent,
} from "@/action/lemonSqueezyAction";

export async function POST(request: Request) {
  if (!process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    return new Response("Lemon Squeezy Webhook Secret not set in .env", {
      status: 500,
    });
  }

  // First, make sure the request is from Lemon Squeezy.
  const rawBody = await request.text();
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
  const signature = Buffer.from(
    request.headers.get("X-Signature") || "",
    "utf8"
  );

  if (!crypto.timingSafeEqual(digest, signature)) {
    throw new Error("Invalid signature.");
  }

  const data = JSON.parse(rawBody) as unknown;

  // Type guard to check if the object has a 'meta' property.
  if (webhookHasMeta(data)) {
    const webhookEventId = await storeWebhookEvent(data.meta.event_name, data);
    // 사실은 ID가 아니고 객체인데, 공식문서에서 페이크 쓴듯.
    if (!webhookEventId) {
      console.log("!webhookEventId");

      return new Response("Error", { status: 500 });
    }

    // Non-blocking call to process the webhook event. // 가이드에는 이렇게 적혀있는데, 이거 때문에 문제 (Error: Webhook event #b4dc7bfc-2d30-4c3b-8cc4-7dc6c235b5f7 not found in the database) 이런 에러가 발생하는 거 같다.
    // await 붙여서 실험.
    try {
      await processWebhookEvent(webhookEventId);
      return new Response("OK", { status: 200 });
    } catch (err) {
      return new Response(`Error : ${err}`, { status: 500 });
    }
  }

  return new Response("Data invalid", { status: 400 });
}
