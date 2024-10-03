import { getUserSubscriptionsNotExpiredByUserId } from "@/action/lemonSqueezyAction";
import {
  getHeatmapInfoMap,
  getUserFirstTimerByUserId,
  getUserIdByTimerId,
} from "@/action/timerAction";
import { Heatmap } from "@/components/heatmap/Heatmap";
import HeatmapFrame from "@/components/heatmap/HeatmapFrame";
import Pomodoro from "@/components/pomodoro/Pomodoro";
import { buttonVariants } from "@/components/ui/button";
import PleaseSubscribe from "@/components/widget/PleaseSubscribe";
import { createClient } from "@/utils/supabase/server";
import { Client } from "@notionhq/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const page = async ({ params }: { params: { id: string } }) => {
  // timerId로 연결된 데이터베이스 아이디를 가져온다음 노션 에이피아이로 데이터베이스 안의 정보들을 가져오자.
  // https://developers.notion.com/reference/post-database-query

  const timerId = params.id;

  const userIdRes = await getUserIdByTimerId(timerId);

  if (!userIdRes || userIdRes.length === 0 || !userIdRes[0].users) {
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

  const userId = userIdRes[0].users.id;
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

  const { map, minYear, maxYear, success, err } = await getHeatmapInfoMap(
    timerId
  );

  let errMessage = "";
  let link = "";
  let buttonName = "Edit Page";
  if (err) {
    if (err.split(":")[0] === "Could not find sort property with name or id") {
      const errSplit = err.split(":");

      const errColumns = [];
      for (let i = 0; i < errSplit.length; i++) {
        if (i === 0) {
          continue;
        }

        errColumns.push(errSplit[i]);
      }
      errMessage = `Please Make the ${errColumns} Column in (Notion)Database.
      Or Go to Edit Page And Select Database And Click the Sync Button`;
      link = `/edit-timer/${timerId}`;

      if (errColumns.indexOf("Name") !== -1) {
        errMessage +=
          "If Name Column Exists, Please Name Change Name Columns type to title";
      }
    } else if (err === "404") {
      errMessage = "Your Database Or Timer Not Found. Plaease Check.";
      link = "/my-timers";
      buttonName = "My-Timers";
    }
  }

  return (
    <div>
      {success && !err && map && minYear && maxYear ? (
        flag ? (
          <div className="p-5">
            <HeatmapFrame
              mp={map}
              minYear={minYear}
              maxYear={maxYear}
              timerId={timerId}
            />
          </div>
        ) : (
          <PleaseSubscribe />
        )
      ) : (
        <div>
          <h3>Something went wrong</h3>
          {errMessage}
          <Link
            className={buttonVariants({ variant: "default" })}
            href={link}
            target="_blank"
          >
            {buttonName}
          </Link>
        </div>
      )}
    </div>
  );
};

export default page;
