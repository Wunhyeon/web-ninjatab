import { getUserSubscriptionsNotExpired } from "@/action/lemonSqueezyAction";
import { getUserFirstTimer } from "@/action/timerAction";
import CreateTimerFrame from "@/components/create-timer/CreateTimerFrame";
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

  // const initialNotionInfo = await getNotionInfo();
  const userNotionInfo = await supabase
    .from("notion_info")
    .select("id, workspace_name")
    .eq("user_id", user.data.user.id)
    .is("deleted_at", null); // access_token, workspace_id, database_id는 극비로 한다. 극도로 조심해서 다뤄야 함.

  // 구독 했나 안했나
  const subscriptionInfo = await getUserSubscriptionsNotExpired();
  const firstTimer = await getUserFirstTimer();

  let isSubscribe =
    subscriptionInfo && subscriptionInfo.length > 0 ? true : false;

  let isFirstTimerExist = firstTimer && firstTimer.length > 0 ? true : false;

  if (!isSubscribe) {
    // alert("Subscribe to create more timers!");
    // 구독을 안했는데, 이미 만들어진 첫번째 타이머가 있다면.
    if (firstTimer && firstTimer.length > 0) {
      redirect("/please-subscribe");
    }
  }

  return (
    <div>
      <CreateTimerFrame
        userNotionInfo={userNotionInfo.data ? userNotionInfo.data : []}
        isSubscribe
        isFirstTimerExist
      />
    </div>
  );
};

export default page;
