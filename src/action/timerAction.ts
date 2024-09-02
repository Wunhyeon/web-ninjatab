"use server";

import { createClient } from "@/utils/supabase/server";

export const insertNewTimer = async (name: string) => {
  const supabase = createClient();

  try {
    const user = await supabase.auth.getUser();

    const { data, error, status } = await supabase
      .from("timers")
      .insert({ name, user_id: user.data.user!.id });

    if (error) {
      throw new Error(error.message);
    }

    return JSON.stringify({ success: true, err: null });
  } catch (err) {
    console.log("err in insertNewTimer : ", err);

    return JSON.stringify({ success: false, err: err });
  }
};

// export const selectTimerInfo = async(id : string) => {
//   const supabase = createClient();

//   try{
//     const timer =
//   }catch(err){

//   }
// }
