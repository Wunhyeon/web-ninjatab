import NotionConnect from "@/components/edit-timer/NotionConnect";
import NotionConnectLink from "@/components/NotionConnectLink";
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

const page = async ({ params }: { params: { id: string } }) => {
  console.log("params : ", params);

  const supabase = createClient();
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    redirect(`/please-login?message=${LOGIN_AGAIN}`);
  }

  //   timer Info
  const timerInfo = await supabase
    .from("timers")
    .select("*, notion_database_info(*)")
    .eq("id", params.id)
    .eq("user_id", user.data.user.id);

  console.log("data : ", timerInfo);

  const notionInfo = await supabase
    .from("notion_info")
    .select("*")
    .eq("user_id", user.data.user.id);

  console.log("notionInfo : ", notionInfo);

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle>Edit Timer</CardTitle>
        <CardDescription>Manage your pomodoro timers.</CardDescription>
      </CardHeader>

      <CardContent>
        {/* notion */}
        <Card>
          <CardHeader>
            <CardTitle>Database</CardTitle>
            <CardDescription>Database Connected Timer</CardDescription>
          </CardHeader>
          <CardContent>
            {notionInfo.data?.length === 0 ? (
              <div>
                <p>Notion is Not Connected</p>
                <NotionConnectLink content="Notion Connect" />
              </div>
            ) : (
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    className="w-full"
                    defaultValue="Gamer Gear Pro Controller"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="description">Description</Label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </CardContent>
      <CardFooter>
        {/* <div className="text-xs text-muted-foreground">
          Showing <strong>1-10</strong> of <strong>32</strong> products
        </div> */}
      </CardFooter>
    </Card>
  );
};

export default page;
