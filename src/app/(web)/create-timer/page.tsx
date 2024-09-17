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

  return (
    <div>
      <CreateTimerFrame
        userNotionInfo={userNotionInfo.data ? userNotionInfo.data : []}
      />
    </div>
  );
};

export default page;
