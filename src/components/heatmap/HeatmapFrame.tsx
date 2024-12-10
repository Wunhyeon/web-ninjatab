"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Heatmap } from "./Heatmap";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { getHeatmapInfoMap } from "@/action/timerAction";
import { Spinner } from "../Spinner";
import RefreshIcon from "../RefreshIcon";
import { toast } from "sonner";
import { sendGAEvent } from "@next/third-parties/google";
import {
  WIDGET_HEATMAP_REFRESH,
  WIDGET_HEATMAP_YEAR_SELECT,
  WIDGET_TIMER_LOGO_LINK,
} from "@/lib/GAEvent";
import Link from "next/link";
import { ORIGIN } from "@/lib/constant";
import { HeatmapMap, TimeZone } from "@/lib/types";
import HeamapWidgetError from "./HeatmapWidgetError";
import HeatmapWidgetError from "./HeatmapWidgetError";

const HeatmapFrame = ({
  // mp,
  // minYear,
  // maxYear,
  timerId,
}: //   maxCount,

{
  // mp: HeatmapMap;
  // minYear: number;
  // maxYear: number;
  timerId: string;
  //   maxCount: number;
}) => {
  function useReRenderer() {
    const [, setState] = useState({});
    return useCallback(() => setState({}), []);
  }

  const [calendarData, setCalendarData] = useState<
    { date: string; count: number; level: number }[]
  >([]);
  // const [mp, setMp] = useState<HeatmapMap>();
  const [minYear, setMinYear] = useState<number>();
  // const [calendarDataMp, setCalendarDataMp] = useState<HeatmapMap>();
  const [initLoading, setInitLoading] = useState(true);

  const mpRef = useRef<HeatmapMap>();
  const calendarDataMpRef = useRef<HeatmapMap>();
  const calendarDataRef =
    useRef<{ date: string; count: number; level: number }[]>();

  const [yearList, setYearList] = useState<string[]>([]);
  const router = useRouter();

  const isLoadingRef = useRef(false);
  const reRender = useReRenderer();

  // **********

  const handleRefresh = async () => {
    if (isLoadingRef.current) {
      return;
    }
    isLoadingRef.current = true;
    reRender();
    const { map, minYear, maxYear, success, err } = await getHeatmapInfoMap(
      timerId,
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );
    if (!success || !map || !minYear) {
      toast.error("Server Error", { closeButton: true });
      // router.refresh();

      return <HeamapWidgetError />;
    }
    // 여기 고민좀 해보자. 새로고침 하는 부분.
    // mp = map;

    // setMp(map);
    mpRef.current = map;
    setMinYear(minYear);
    // setCalendarDataMp(mp!); // 바로 위에서 설정해주고 있음.
    calendarDataMpRef.current = map;

    // select에 들어갈 년도들
    const date = new Date();
    const thisYear = date.getFullYear();
    const tmpYearList = [];
    tmpYearList.push("Recent");
    for (let i = thisYear; i >= minYear; i--) {
      tmpYearList.push(String(i));
    }
    setYearList(tmpYearList);

    // 처음 데이터들은 Recent
    divideYear("Recent");

    isLoadingRef.current = false;
    reRender();
  };

  const divideYear = (year: string) => {
    if (!mpRef.current) {
      return <HeatmapWidgetError />;
    }

    const date = new Date();
    const data: { date: string; count: number; level: number }[] = [];
    let maxCount = 0;
    let measureYear = year;
    if (year === "Recent") {
      measureYear = date.getFullYear().toString();
    }
    // 단위(년도)별 maxCount 구하기
    for (const [key, value] of mpRef.current) {
      const dateSplit = key.split("-");
      const dataYear = dateSplit[0];
      if (dataYear != String(measureYear)) {
        continue;
      }
      if (value.count > maxCount) {
        maxCount = value.count;
      }
    }
    // data 넣어주기
    if (!mpRef.current.get(`${measureYear}-01-01`)) {
      data.push({ date: `${measureYear}-01-01`, count: 0, level: 0 });
    }

    for (const [key, value] of mpRef.current) {
      const dateSplit = key.split("-");
      const dataYear = dateSplit[0];

      if (dataYear != String(measureYear)) {
        continue;
      }
      data.push({
        date: key,
        count: value.count,
        level: Math.floor(((value.count / maxCount) * 10) / 3) + 1, // maxLevel : 4 (default). 4단계로 나눠져 있으니, (0까지 포함하면 5단계) 4단계 -1 = 3단계로 나눠주고, 1개라도 포함되어있으면 색칠되어야 하니 +1 을 더해준다.
      });
    }

    if (year === "Recent") {
      // const today = date.toISOString().split("T")[0];

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 1을 더합니다.
      const day = String(date.getDate()).padStart(2, "0");

      const today = `${year}-${month}-${day}`;

      if (!mpRef.current.get(today)) {
        data.push({
          date: today,
          count: 0,
          level: 0,
        });
      }
    } else {
      if (!mpRef.current.get(`${measureYear}-12-31`)) {
        data.push({
          date: `${measureYear}-12-31`,
          count: 0,
          level: 0,
        });
      }
    }

    setCalendarData(data);
    calendarDataRef.current = data;
  };

  // 시작시. 기본 올해년도.
  useEffect(() => {
    const init = async () => {
      await handleRefresh();

      const date = new Date();
      const thisYear = date.getFullYear();

      // select에 들어갈 년도들
      const tmpYearList = [];
      tmpYearList.push("Recent");
      let selectMinYear = minYear || new Date().getFullYear();
      for (let i = thisYear; i >= selectMinYear; i--) {
        tmpYearList.push(String(i));
      }
      setYearList(tmpYearList);

      // 처음 데이터들은 Recent
      divideYear("Recent");
      setInitLoading(false);
    };
    init();
  }, []);

  return (
    <div>
      {initLoading || !calendarDataRef.current || !calendarDataMpRef.current ? (
        <div>Loading...</div>
      ) : (
        <div>
          <Link
            href={`${ORIGIN}`}
            target="_blank"
            onClick={() => {
              sendGAEvent("event", WIDGET_TIMER_LOGO_LINK.event, {
                value: WIDGET_TIMER_LOGO_LINK.value,
              });
            }}
          >
            <h1 className="inline-block text-lg sm:text-xl font-bold">
              PomoLog
            </h1>
          </Link>

          <Card className="ml-7 relative">
            <div className="flex justify-between mb-4">
              <Select
                onValueChange={(value) => {
                  divideYear(value);
                  sendGAEvent("event", WIDGET_HEATMAP_YEAR_SELECT.event, {
                    value: WIDGET_HEATMAP_YEAR_SELECT.value,
                  });
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Recent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Year</SelectLabel>
                    {yearList.map((el, idx) => {
                      return (
                        <SelectItem key={idx} value={el}>
                          {el}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                onClick={async () => {
                  // router.refresh();
                  await handleRefresh();
                  sendGAEvent("event", WIDGET_HEATMAP_REFRESH.event, {
                    value: WIDGET_HEATMAP_REFRESH.value,
                  });
                }}
                disabled={isLoadingRef.current}
                className="absolute top-3 right-3"
              >
                {isLoadingRef.current ? <Spinner /> : <RefreshIcon />}
              </Button>
            </div>
            <Heatmap
              data={calendarData}
              mp={
                calendarDataMpRef.current
                  ? calendarDataMpRef.current
                  : new Map()
              }
              timerId={timerId}
            />
          </Card>
        </div>
      )}
    </div>
  );
};

export default HeatmapFrame;
