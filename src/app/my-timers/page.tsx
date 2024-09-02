import MyTimersList from "@/components/my-timers/MyTimersList";
import { createClient } from "@/utils/supabase/server";
import React from "react";

const page = async () => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("timers")
    .select("id,name,notion_info(id,database_name)")
    .order("created_at", { ascending: false });
  console.log("data : ", data);

  return (
    <div>
      <MyTimersList data={data ? data : []} />
    </div>
  );
};

export default page;
