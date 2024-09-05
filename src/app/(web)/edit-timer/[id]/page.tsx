import { getNotionInfo } from "@/action/timerAction";
import CopyLinkCard from "@/components/edit-timer/CopyLinkCard";
import DatabaseInfo from "@/components/edit-timer/DatabaseInfo";
import EditTimerFrame from "@/components/edit-timer/EditTimerFrame";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LOGIN_AGAIN } from "@/lib/constant";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import React from "react";
import { toast } from "sonner";

export default async function page({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    redirect(`/please-login?message=${LOGIN_AGAIN}`);
  }

  //   timer Info
  const timerInfo = await supabase
    .from("timers")
    .select("*, notion_database_info(id,database_name, notion_info_id)")
    .eq("id", params.id)
    .eq("user_id", user.data.user.id);

  if (timerInfo.error) {
    // error handling
    redirect("/");
  }

  // const notionInfo = await supabase
  //   .from("notion_info")
  //   .select("id, workspace_name")
  //   .eq("user_id", user.data.user.id)
  //   .is("deleted_at", null); // access_token, workspace_id, database_id는 극비로 한다. 극도로 조심해서 다뤄야 함.

  // const initialNotionInfo = await getNotionInfo();
  const userNotionInfo = await supabase
    .from("notion_info")
    .select("id, workspace_name")
    .eq("user_id", user.data.user.id)
    .is("deleted_at", null); // access_token, workspace_id, database_id는 극비로 한다. 극도로 조심해서 다뤄야 함.

  return (
    <div className="flex-col">
      <h2>{timerInfo.data![0].name}</h2>
      <CopyLinkCard
        timerId={params.id}
        databaseName={
          timerInfo.data[0].notion_database_info.length
            ? timerInfo.data[0].notion_database_info[0].database_name
            : null
        }
      />
      <EditTimerFrame
        timerId={params.id}
        userNotionInfo={userNotionInfo.data?.length ? userNotionInfo.data : []}
      />
    </div>
  );
}
