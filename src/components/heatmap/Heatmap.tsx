"use client";

import React, { useEffect, useState } from "react";
import ActivityCalendar, { ThemeInput } from "react-activity-calendar";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

export const Heatmap = ({
  data,
}: {
  data: {
    date: string;
    count: number;
    level: number;
  }[];
}) => {
  const explicitTheme: ThemeInput = {
    light: ["#f0f0f0", "#c4edde", "#7ac7c4", "#f73859", "#384259"],
    dark: ["#383838", "#4D455D", "#7DB9B6", "#F5E9CF", "#E96479"],
  };
  return (
    <div>
      <ActivityCalendar
        data={data}
        renderBlock={(block, activity) =>
          React.cloneElement(block, {
            "data-tooltip-id": "react-tooltip",
            "data-tooltip-html": `${activity.count} activities on ${activity.date}`,
          })
        }
        theme={explicitTheme}
        blockSize={16}
        showWeekdayLabels={true}
      />
      <ReactTooltip id="react-tooltip" />
    </div>
  );
};
