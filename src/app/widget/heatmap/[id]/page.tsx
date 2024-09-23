import { getHeatmapInfoMap } from "@/action/timerAction";
import { Heatmap } from "@/components/heatmap/Heatmap";
import HeatmapFrame from "@/components/heatmap/HeatmapFrame";
import Pomodoro from "@/components/pomodoro/Pomodoro";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { Client } from "@notionhq/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const page = async ({ params }: { params: { id: string } }) => {
  // timerId로 연결된 데이터베이스 아이디를 가져온다음 노션 에이피아이로 데이터베이스 안의 정보들을 가져오자.
  // https://developers.notion.com/reference/post-database-query

  const timerId = params.id;

  const { map, minYear, maxYear, success, err } = await getHeatmapInfoMap(
    timerId
  );

  let errMessage = "";
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
      errMessage = `Please Make the ${errColumns} Column in Database.`;

      if (errColumns.indexOf("Name") !== -1) {
        errMessage +=
          "If Name Column Exists, Please Name Change Name Columns type to title";
      }
    }
    console.log("errMessage : ", errMessage);
  }

  return (
    <div>
      {success && !err && map && minYear && maxYear ? (
        <HeatmapFrame
          mp={map}
          minYear={minYear}
          maxYear={maxYear}
          timerId={timerId}
        />
      ) : (
        <div>
          <h3>Something went wrong</h3>
          {errMessage}
          <Link
            className={buttonVariants({ variant: "default" })}
            href={`/edit-timer/${timerId}`}
            target="_blank"
          >
            Go to Edit timer page
          </Link>
        </div>
      )}
    </div>
  );
};

export default page;
