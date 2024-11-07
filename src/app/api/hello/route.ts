import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/serviceRoleServer";

export const dynamic = "force-dynamic"; // static by default, unless reading the request

export const runtime = "nodejs";
export async function GET(request: Request) {
  const supabase = createServiceRoleClient();
  const timers = await supabase.from("webhook_event").select("*");
  return new Response(
    `Hello from ${process.env.VERCEL_REGION}, timers : ${timers.data}`
  );
}
