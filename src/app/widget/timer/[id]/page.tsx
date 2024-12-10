import {
  getUserSubscriptionsNotExpired,
  getUserSubscriptionsNotExpiredByUserId,
} from "@/action/lemonSqueezyAction";
import {
  getUserFirstTimer,
  getUserFirstTimerByUserId,
} from "@/action/timerAction";
import Pomodoro from "@/components/pomodoro/Pomodoro";
import { buttonVariants } from "@/components/ui/button";
import PleaseSubscribe from "@/components/widget/PleaseSubscribe";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import React from "react";

const page = async ({ params }: { params: { id: string } }) => {
  const timerId = params.id;
  const supabase = createClient();
  const timerInfo = await supabase
    .from("timers")
    .select("*, users(id)") // 지금 여기가 server component에서 이렇게 하는거. user 정보는 될 수 있으면 id나 name정보만 선택하도록 제한하자. 보안철저.
    .eq("id", timerId)
    .is("deleted_at", null);

  if (
    !timerInfo.data ||
    timerInfo.data.length === 0 ||
    !timerInfo.data[0].users
  ) {
    return (
      <div>
        <p>Something wrong. Your Timer Or Database Not Founded. Please Check</p>
        <Link
          href="/my-timers"
          className={buttonVariants({ variant: "default" })}
        >
          Go to check
        </Link>
      </div>
    );
  }

  const userId = timerInfo.data[0].users.id;

  // 구독 했나 안했나
  const [subscriptionInfo, firstTimerInfo] = await Promise.all([
    getUserSubscriptionsNotExpiredByUserId(userId),
    getUserFirstTimerByUserId(userId),
  ]);

  let flag = true;
  if (
    firstTimerInfo &&
    firstTimerInfo.length &&
    firstTimerInfo[0].id === timerId
  ) {
    // 첫번째 타이머면 구독 여부와 상관없이 사용가능.
    flag = true;
  } else if (
    (!subscriptionInfo || subscriptionInfo.length === 0) &&
    firstTimerInfo &&
    firstTimerInfo.length &&
    firstTimerInfo[0].id !== timerId
  ) {
    // 첫번째 타이머가 아니고, 구독을 안했으면 작동안하게
    flag = false;
    return <PleaseSubscribe />;
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
      {flag ? (
        <Pomodoro
          timerId={timerId}
          savedWorkMinutes={data[0].worktime!}
          savedBreakMinuts={data[0].breaktime!}
          alarmSoundOn={data[0].alarm_sound_on}
          tickingSoundOn={data[0].ticking_sound_on}
        />
      ) : (
        <PleaseSubscribe />
      )}
    </div>
  );
};

export default page;
