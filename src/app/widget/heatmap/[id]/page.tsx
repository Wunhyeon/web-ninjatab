import { getHeatmapInfoMap } from "@/action/timerAction";
import { Heatmap } from "@/components/heatmap/Heatmap";
import HeatmapFrame from "@/components/heatmap/HeatmapFrame";
import Pomodoro from "@/components/pomodoro/Pomodoro";
import { createClient } from "@/utils/supabase/server";
import { Client } from "@notionhq/client";
import { redirect } from "next/navigation";
import React from "react";

const page = async ({ params }: { params: { id: string } }) => {
  // timerId로 연결된 데이터베이스 아이디를 가져온다음 노션 에이피아이로 데이터베이스 안의 정보들을 가져오자.
  // https://developers.notion.com/reference/post-database-query

  const timerId = params.id;

  const { map, minYear, maxYear } = await getHeatmapInfoMap(timerId);

  return (
    <div>
      HeatMap
      <HeatmapFrame
        mp={map}
        minYear={minYear}
        maxYear={maxYear}
        timerId={timerId}
      />
    </div>
  );
};

export default page;
