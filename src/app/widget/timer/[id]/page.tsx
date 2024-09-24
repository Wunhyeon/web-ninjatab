import Pomodoro from "@/components/pomodoro/Pomodoro";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import React from "react";

const page = async ({ params }: { params: { id: string } }) => {
  const timerId = params.id;
  const supabase = createClient();
  const timerInfo = await supabase
    .from("timers")
    .select("*")
    .eq("id", timerId)
    .is("deleted_at", null);

  if (!timerInfo.data || timerInfo.data.length === 0) {
    return (
      <div>
        Something wrong. Your Timer Or Database Not Founded. Please Check
        <Link
          href="/my-timers"
          className={buttonVariants({ variant: "default" })}
        >
          Go to check
        </Link>
      </div>
    );
  }

  /* Todo
   * 결제안된 유저일때 제일 처음 1개만.
   * 결제 기한 지났을 때 어떻게 처리해줄 것인지.
   * 보안 철저히.
   */
  if (timerInfo.error) {
    return { message: "server error" };
  }
  const data = timerInfo.data;

  return (
    <div>
      <Pomodoro
        timerId={timerId}
        savedWorkMinutes={data[0].worktime!}
        savedBreakMinuts={data[0].breaktime!}
        alarmSoundOn={data[0].alarm_sound_on}
        tickingSoundOn={data[0].ticking_sound_on}
      />
    </div>
  );
};

export default page;
