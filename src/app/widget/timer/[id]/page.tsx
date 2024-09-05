import { createClient } from "@/utils/supabase/server";
import React from "react";

const page = async ({ params }: { params: { id: string } }) => {
  const timerId = params.id;
  const supabase = createClient();
  const timerInfo = await supabase.from("timers").select("*").eq("id", timerId);

  console.log("timerInfo : ", timerInfo);

  return <div>timer</div>;
};

export default page;
