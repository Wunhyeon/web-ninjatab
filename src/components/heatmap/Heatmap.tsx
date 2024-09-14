"use client";

import React, { useEffect, useRef, useState } from "react";
import ActivityCalendar, { ThemeInput } from "react-activity-calendar";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

export const Heatmap = ({
  data,
  mp,
}: {
  data: {
    date: string;
    count: number;
    level: number;
  }[];
  mp: Map<
    string,
    {
      count: number;
      object: {
        name: string;
        id: string;
      }[];
    }
  >;
}) => {
  const explicitTheme: ThemeInput = {
    light: ["#f0f0f0", "#c4edde", "#7ac7c4", "#f73859", "#384259"],
    dark: ["#383838", "#4D455D", "#7DB9B6", "#F5E9CF", "#E96479"],
  };

  return (
    <div className="text-3x">
      <ActivityCalendar
        data={data}
        renderBlock={(block, activity) =>
          React.cloneElement(block, {
            "data-tooltip-id": "react-tooltip",
            "data-tooltip-html": `<div><h3 class="text-xl">${activity.date}</h3>
          
             ${
               mp.get(activity.date) && mp.get(activity.date)!.object.length > 0
                 ? "<h5 class='text-lg font-semibold'>Done List</h5>" +
                   mp
                     .get(activity.date)
                     ?.object.map((el, idx) => {
                       return `<div key={idx}>● ${el.name}</div>`;
                     })
                     .join("")
                 : ""
             }
             <br/>
            ${activity.count} activities on ${activity.date}</div>`,
          })
        }
        theme={explicitTheme}
        blockSize={16}
        showWeekdayLabels={true}
      />
      <ReactTooltip id="react-tooltip" />

      <div>
        <h3 className="text-3xl">2024-09-12</h3>
        {mp.get("2024-09-12") && mp.get("2024-09-12")!.object.length > 0
          ? mp
              .get("2024-09-12")
              ?.object.map((el, idx) => `<div key={idx}>${el.name}</div>`)
          : ""}
        <ul>
          {mp.get("2024-09-12")?.object.map((el, idx) => (
            <li key={idx}>{el.name}</li>
          ))}
        </ul>
        12 activities on 2024-09-12
      </div>
    </div>
  );
};
