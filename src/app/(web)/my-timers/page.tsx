import { getUserSubscriptionsNotExpired } from "@/action/lemonSqueezyAction";
import MyTimersList from "@/components/my-timers/MyTimersList";
import { LOGIN_AGAIN } from "@/lib/constant";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

const page = async () => {
  const supabase = createClient();
  const user = await supabase.auth.getUser();

  if (!user.data.user) {
    redirect(`/please-login?message=${LOGIN_AGAIN}`);
  }

  const { data, error } = await supabase
    .from("timers")
    .select("id,name,notion_database_info(id,database_name,database_id)")
    .eq("user_id", user.data.user?.id)
    .order("created_at", { ascending: false })
    .is("deleted_at", null);

  if (error) {
  }

  // 구독 했나 안했나
  const subscriptionInfo = await getUserSubscriptionsNotExpired();

  let isSubscribe =
    subscriptionInfo && subscriptionInfo.length > 0 ? true : false;

  return (
    <div>
      <MyTimersList data={data ? data : []} isSubscribe={isSubscribe} />
    </div>
  );
};

export default page;
