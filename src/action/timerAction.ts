"use server";

import {
  ERROR_SERVER_500,
  ERROR_USER_NOT_AUTHORIZED,
  LOGIN_AGAIN,
} from "@/lib/constant";
import { createClient } from "@/utils/supabase/server";
import { Client } from "@notionhq/client";
import { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import { error } from "console";
import { redirect } from "next/navigation";
import { TimeZone } from "@/lib/types";

interface notionError extends Error {
  body: string;
}

/**
 * getUser. 유저 객체를 돌려준다. 유저 객체가 없으면 please-login page로 리다이렉트 시킨다.
 * serverAction안에서만 쓸 것
 * @returns user.data.user
 */
const getUser = async () => {
  const supabase = createClient();

  try {
    const user = await supabase.auth.getUser();

    if (!user.data.user) {
      throw new Error(
        JSON.stringify({ statusCode: 401, title: ERROR_USER_NOT_AUTHORIZED })
      );
    }

    return user.data.user;
  } catch (err) {
    redirect(`/please-login?message=${LOGIN_AGAIN}`);
  }
};

export const insertNewTimer = async (name: string) => {
  const supabase = createClient();

  try {
    const user = await supabase.auth.getUser();

    const { data, error, status } = await supabase
      .from("timers")
      .insert({ name, user_id: user.data.user!.id });

    if (error) {
      throw new Error(
        JSON.stringify({ statusCode: 500, title: "Insert Error" })
      );
    }

    return JSON.stringify({ success: true, err: null });
  } catch (err) {
    console.log("err in insertNewTimer : ", err);

    return JSON.stringify({ success: false, err: err });
  }
};

/**
 * getTimerInfo
 * export 하지 말고 여기서만 사용할 것.
 * @returns timer의 모든 정보, notion_database_info의 id, database_name. 그리고 workspace등의 id를 저장한 notion_info_id
 */
const getTimerInfo = async (timerId: string) => {
  const supabase = createClient();

  try {
    const timerInfo = await supabase
      .from("timers")
      .select(
        "id,notion_database_info(id,database_id,notion_info(id,access_token))"
      )
      .eq("id", timerId)
      .is("deleted_at", null) // timers의 deleted_at이 null인지 확인
      .filter("notion_database_info.deleted_at", "is", null) // notion_database_info의 deleted_at이 null인지 확인
      .filter("notion_database_info.notion_info.deleted_at", "is", null); // notion_info의 deleted_at이 null인지 확인

    if (timerInfo.error || !timerInfo.data || timerInfo.data.length === 0) {
      // error handling
      return;
    }
    const notionDatabaseInfo = timerInfo.data[0].notion_database_info;

    if (!notionDatabaseInfo || notionDatabaseInfo.length === 0) {
      // error handling
      return;
    }
    if (!notionDatabaseInfo[0].notion_info) {
      // error handling
      return;
    }

    return timerInfo;
  } catch (err) {
    return null;
  }
};

/**
 * getNotionInfo
 * @returns 유저의 notion_info들의 id와 workspace_name
 */
export const getNotionInfo = async () => {
  const supabase = createClient();
  const user = await getUser();

  try {
    const { data, error } = await supabase
      .from("notion_info")
      .select("id, workspace_name")
      .eq("user_id", user.id)
      .is("deleted_at", null); // access_token, workspace_id, database_id는 극비로 한다. 극도로 조심해서 다뤄야 함.

    console.log("Timer Action! - getNotionInfo - data :  ", data);
    console.log("Timer Action! - getNotionInfo - error :  ", error);

    if (error) {
      throw new Error(
        JSON.stringify({ statusCode: 500, title: ERROR_SERVER_500 })
      );
    }

    return JSON.stringify({ success: true, data });
  } catch (err) {
    return JSON.stringify({ success: false, err });
  }
};

export const upsertNotionDatabaseInfo = async (
  timerId: string,
  notionInfoId: string,
  databaseId: string,
  databaseName: string
) => {
  const supabase = createClient();
  const user = await getUser();

  try {
    const res = await supabase
      .from("notion_database_info")
      .select("id, timers(id,user_id)")
      .eq("timer_id", timerId)
      .eq("timers.user_id", user.id);
    console.log("res :", res);

    if (res.error) {
      throw new Error(
        JSON.stringify({
          statusCode: 500,
          title: "can not select notion_database_info",
        })
      );
    }

    if (res.data.length > 0) {
      // data가 이미 있는 경우 업데이트. (timer와 notion_database_info는 1:1 relation)
      const { data, error } = await supabase
        .from("notion_database_info")
        .update({
          notion_info_id: notionInfoId,
          database_id: databaseId,
          database_name: databaseName,
          // updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("timer_id", timerId);

      return JSON.stringify({ success: true });
    } else {
      const { data, error } = await supabase
        .from("notion_database_info")
        .insert({
          timer_id: timerId,
          notion_info_id: notionInfoId,
          database_id: databaseId,
          database_name: databaseName,
          user_id: user.id,
        });

      if (error) {
        console.log("error : ", error);

        throw new Error(
          JSON.stringify({
            statusCode: 500,
            title: "can not insert notion_database_info",
          })
        );
      }

      return JSON.stringify({ success: true });
    }

    console.log("res : ", res);
  } catch (err) {
    return JSON.stringify({ success: false, err: (err as Error).message });
  }
};

const getHeatmapInfo = async (timerId: string) => {
  const supabase = createClient();
  try {
    const timerInfo = await supabase
      .from("timers")
      .select(
        "*,notion_database_info(id,database_id,notion_info(id,access_token))"
      )
      .eq("id", timerId);

    if (timerInfo.error) {
      throw new Error(
        JSON.stringify({
          statusCode: 500,
          title: "can not insert notion_database_info",
        })
      );
    }

    const data = timerInfo.data;

    const notionDatabaseInfo = data[0].notion_database_info;

    const databaseId = notionDatabaseInfo[0].database_id;
    const accessToken = notionDatabaseInfo[0].notion_info?.access_token;

    const notion = new Client({ auth: accessToken });

    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: "Date",
          direction: "ascending",
        },
      ],
    });

    return JSON.stringify({ success: true, data: response });
  } catch (err) {
    return JSON.stringify({ success: false, err: (err as Error).message });
  }
};

export const getHeatmapInfoMap = async (timerId: string) => {
  const res = await getHeatmapInfo(timerId);
  const parseData: { success: boolean; err: string | undefined; data: any } =
    JSON.parse(res);

  if (parseData.success === false) {
    if (parseData.err) {
      const errSplit = parseData.err.split(":");
      if (errSplit[0] === "Could not find sort property with name or id") {
        return { success: false, err: parseData.err };
      }
    }
  }

  const data = parseData.data;

  const todayDate = new Date();
  let minYear = todayDate.getFullYear();
  let maxYear = todayDate.getFullYear();
  let maxCount = 0;

  const results: {
    object: string;
    id: string;
    parent: { type: string; database_id: string };
    properties: {
      Date: {
        id: string;
        type: string;
        date: { start: string; end: string | null };
      };
      Name: {
        id: string;
        type: string;
        title: { plain_text: string; type: string }[];
      };
    };
  }[] = data.results;

  const mp = new Map<
    string,
    { count: number; object: { name: string; id: string }[] }
  >();
  results.forEach((el) => {
    if (
      !el.properties ||
      !el.properties.Date ||
      !el.properties.Date.date ||
      !el.properties.Date.date.start
    ) {
      return;
    }
    const date = el.properties.Date.date.start.split("T")[0];
    const mpGet = mp.get(date);
    if (mpGet) {
      mpGet.count++;
      mpGet.object.push({
        name:
          el.properties.Name.title.length &&
          el.properties.Name.title[0].plain_text
            ? el.properties.Name.title[0].plain_text
            : "",
        id: el.id,
      });

      if (mpGet.count > maxCount) {
        maxCount = mpGet.count;
      }
    } else {
      mp.set(date, {
        count: 1,
        object: [
          {
            name:
              el.properties.Name.title.length &&
              el.properties.Name.title[0].plain_text
                ? el.properties.Name.title[0].plain_text
                : "",
            id: el.id,
          },
        ],
      });

      if (1 > maxCount) {
        maxCount = 1;
      }
    }

    const dateSplit = date.split("-");
    const dateYear = dateSplit[0];
    const numDateYear = Number(dateYear);
    if (numDateYear < minYear) {
      minYear = numDateYear;
    }
    if (numDateYear > maxYear) {
      maxYear = numDateYear;
    }
  });

  return { map: mp, minYear, maxYear, success: true, err: null };
};

/**
 * DB에 새로운 page row를 넣는 함수. 만들어진 page의 id를 반환한다. Date를 넣지 않는다.
 * @param timerId
 * @param pageName
 * @returns
 */
export const insertNewPageToDBWithoutDate = async (
  timerId: string,
  pageName: string
) => {
  const supabase = createClient();
  try {
    const timerInfo = await getTimerInfo(timerId);

    if (!timerInfo) {
      // error handling
      return;
    }

    const notionDatabaseInfo = timerInfo.data[0].notion_database_info;

    if (!notionDatabaseInfo[0].notion_info) {
      // error handling
      return;
    }

    const notion = new Client({
      auth: notionDatabaseInfo[0].notion_info.access_token,
    });
    const dbId = notionDatabaseInfo[0].database_id;

    const newPage = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: dbId,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: pageName,
              },
            },
          ],
        },
      },
      children: [
        {
          object: "block",
          heading_2: {
            rich_text: [
              {
                text: {
                  content: pageName,
                },
              },
            ],
          },
        },
      ],
    });

    return JSON.stringify({ success: true, err: null, pageId: newPage.id });
  } catch (err) {
    return JSON.stringify({ success: false, err, pageId: null });
  }
};

/**
 * DB에 새로운 page row를 넣는 함수. 만들어진 page의 id를 반환한다. Date를 포함한다.
 * @param timerId
 * @param pageName
 * @returns
 */
export const insertNewPageToDBWithDate = async (
  timerId: string,
  pageName: string,
  startTime: Date,
  endTime: Date,
  timeZone: TimeZone
) => {
  const supabase = createClient();
  try {
    const timerInfo = await getTimerInfo(timerId);

    if (!timerInfo) {
      // error handling
      return;
    }

    const notionDatabaseInfo = timerInfo.data[0].notion_database_info;

    if (!notionDatabaseInfo[0].notion_info) {
      // error handling
      return;
    }

    const notion = new Client({
      auth: notionDatabaseInfo[0].notion_info.access_token,
    });
    const dbId = notionDatabaseInfo[0].database_id;

    const newPage = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: dbId,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: pageName,
              },
            },
          ],
        },
        Date: {
          date: {
            start: startTime.toISOString(),
            end: endTime.toISOString(),
            time_zone: timeZone,
          },
        },
      },
      children: [
        {
          object: "block",
          heading_2: {
            rich_text: [
              {
                text: {
                  content: pageName,
                },
              },
            ],
          },
        },
      ],
    });

    return { success: true, err: null, pageId: newPage.id };
  } catch (err) {
    return { success: false, err, pageId: null };
  }
};

export const updatePageDate = async (
  timerId: string,
  pageId: string,
  pageName: string,
  startDate: Date,
  endDate: Date,
  timeZone: TimeZone
) => {
  // 만약 pageId가 있으면 pageID를 업데이트 하지만, 없다면 새로운 page를 만들어 넣는다.
  const supabase = createClient();
  try {
    const timerInfo = await getTimerInfo(timerId);

    if (!timerInfo) {
      // error handling
      return;
    }

    const notionDatabaseInfo = timerInfo.data[0].notion_database_info;

    if (!notionDatabaseInfo[0].notion_info) {
      // error handling
      return;
    }

    const notion = new Client({
      auth: notionDatabaseInfo[0].notion_info.access_token,
    });
    const dbId = notionDatabaseInfo[0].database_id;

    const page = await notion.pages.retrieve({
      page_id: pageId,
    });
    // update
    const response = await notion.pages.update({
      page_id: pageId,
      properties: {
        Date: {
          date: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            time_zone: timeZone,
          },
        },
      },
    });
    return { success: true, err: null, property: null };
  } catch (err) {
    console.log("@@@ err : ", err);

    if ((err as notionError).body) {
      const errBody = JSON.parse((err as notionError).body);
      if (errBody.status === 404) {
        // pageId가 없을 시 새로 넣음.
        return await insertNewPageToDBWithDate(
          timerId,
          pageName,
          startDate,
          endDate,
          timeZone
        );
      }

      const message: string = errBody.message;
      const messageToArr = message.split(" ");
      const messageBackPart =
        messageToArr[1] +
        messageToArr[2] +
        messageToArr[3] +
        messageToArr[4] +
        messageToArr[5] +
        messageToArr[6];

      if (messageBackPart === "isnotapropertythatexists.") {
        return {
          success: false,
          err: "missingProperty",
          property: messageToArr[0],
        };
      }
    }

    return { success: false };
  }
};
