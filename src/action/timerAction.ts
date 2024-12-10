"use server";

import {
  ERROR_SERVER_500,
  ERROR_USER_NOT_AUTHORIZED,
  LOGIN_AGAIN,
} from "@/lib/constant";
import { createClient } from "@/utils/supabase/server";
import { Client } from "@notionhq/client";
import { redirect } from "next/navigation";
import {
  GetPageResponseWithInTrashAndArchived,
  HeatmapMap,
  TimeZone,
} from "@/lib/types";
import { revalidatePath } from "next/cache";
import { User } from "@supabase/supabase-js";

interface notionError extends Error {
  body: string;
}

/**
 * getUser. 유저 객체를 돌려준다. 유저 객체가 없으면 please-login page로 리다이렉트 시킨다.
 * serverAction안에서만 쓸 것
 * @returns user.data.user
 */
const getUser = async (): Promise<User> => {
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
      .eq("timers.user_id", user.id)
      .is("deleted_at", null);

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
        throw new Error(
          JSON.stringify({
            statusCode: 500,
            title: "can not insert notion_database_info",
          })
        );
      }

      return JSON.stringify({ success: true });
    }
  } catch (err) {
    return JSON.stringify({ success: false, err: (err as Error).message });
  }
};

export const createTimerWithNotionDatabaseInfo = async (
  name: string,
  notionInfoId: string,
  databaseId: string,
  databaseName: string
) => {
  const supabase = createClient();
  const user = await getUser();

  try {
    // timer 생성
    const createTimerResult = await supabase
      .from("timers")
      .insert({ name, user_id: user.id })
      .select();

    if (!createTimerResult.data || createTimerResult.data.length === 0) {
      return { success: false, message: "createTimer Error" };
    }
    const createdTimerId = createTimerResult.data[0].id;

    // notion_database_info 생성
    const createNotionDatabaseInfo = await supabase
      .from("notion_database_info")
      .insert({
        user_id: user.id,
        timer_id: createdTimerId,
        notion_info_id: notionInfoId,
        database_id: databaseId,
        database_name: databaseName,
      });

    if (createNotionDatabaseInfo.error) {
      return { success: false, message: "createNotionDatabaseInfo Error" };
    }
    revalidatePath("/my-timers");
    return { success: true, createdTimerId: createdTimerId };
  } catch (err) {
    return { success: false };
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
      .eq("id", timerId)
      .is("deleted_at", null);

    if (timerInfo.error) {
      throw new Error("500");
    }

    if (timerInfo.data.length === 0) {
      throw new Error("404");
    }

    // const data = timerInfo.data;

    // const notionDatabaseInfo = data[0].notion_database_info;

    // const databaseId = notionDatabaseInfo[0].database_id;
    // const accessToken = notionDatabaseInfo[0].notion_info?.access_token;

    // const notion = new Client({ auth: accessToken });

    // const response = await notion.databases.query({
    //   database_id: databaseId,
    //   sorts: [
    //     {
    //       property: "Date",
    //       direction: "ascending",
    //     },
    //   ],
    // });

    const response2 = await supabase
      .from("heatmaps")
      .select("id, name, start, end, url, pageId")
      .eq("timer_id", timerId)
      .is("deleted_at", null)
      .order("start")
      .limit(5000);

    return JSON.stringify({ success: true, data: response2.data });
  } catch (err) {
    return JSON.stringify({ success: false, err: (err as Error).message });
  }
};

export const getHeatmapInfoMap = async (timerId: string, timeZone: string) => {
  const res = await getHeatmapInfo(timerId);

  const parseData: {
    success: boolean;
    err: string | undefined;
    data: {
      id: string;
      pageId: string;
      name: string;
      url: string;
      start: string;
      end?: string;
    }[];
  } = JSON.parse(res);

  if (parseData.success === false) {
    if (parseData.err) {
      const errSplit = parseData.err.split(":");
      if (errSplit[0] === "Could not find sort property with name or id") {
        return { success: false, err: parseData.err };
      } else if (parseData.err === "404") {
        return { success: false, err: parseData.err };
      }
    }

    return { success: false, err: parseData.err };
  }

  const data = parseData.data;

  const todayDate = new Date();
  let minYear = todayDate.getFullYear();
  let maxYear = todayDate.getFullYear();
  let maxCount = 0;

  const mp: HeatmapMap = new Map();
  data.forEach((el) => {
    if (!el.id || el.name === undefined || el.name === null || !el.start) {
      return;
    }
    const utcDate = new Date(el.start);
    let convertDate = new Intl.DateTimeFormat("ko-KR", {
      // ko-KR 로 해줘야 '연.월.일' 로 나옴. en-EN으로 하면 '월/일/년'으로 나옴.
      timeZone: timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      // hour: "2-digit",
      // minute: "2-digit",
      // second: "2-digit",
      hour12: false,
    }).format(utcDate);
    if (convertDate.endsWith(".")) {
      convertDate = convertDate.slice(0, -1); // 마지막 "." 제거
    }

    const date = convertDate.split(". ").join("-");

    const mpGet = mp.get(date);
    if (mpGet) {
      mpGet.count++;
      mpGet.object.push({
        id: el.id,
        name: el.name ? el.name : "",
        pageId: el.pageId,
        url: el.url,
        start: el.start,
        end: el.end,
      });

      if (mpGet.count > maxCount) {
        maxCount = mpGet.count;
      }
    } else {
      mp.set(date, {
        count: 1,
        object: [
          {
            id: el.id,
            name: el.name ? el.name : "",
            pageId: el.pageId,
            url: el.url,
            start: el.start,
            end: el.end,
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
 * Notion 데이터베이스의 정보들을 얻기 위해. 주로 properties가 뭐가 있는지 알기 위해. (없으면 추가해주려고)
 * @param databaseId
 * @param accessToken
 */
const getDBInfo = async (databaseId: string, accessToken: string) => {
  try {
    const notion = new Client({
      auth: accessToken,
    });
    const response = await notion.databases.retrieve({
      database_id: databaseId,
    });
    return response;
  } catch (err) {}
};

/**
 * Date Property의 타입이 date가 아닐 때, 타입을 date 타입으로 바꿔주기 or Date Property 추가.
 * @param notion
 * @param databaseId
 */
const updateDatePropertyType = async (notion: Client, databaseId: string) => {
  try {
    const response = await notion.databases.update({
      database_id: databaseId,
      properties: { Date: { type: "date", date: {} } },
    });
  } catch (err) {
    console.log("updateDatePropertyType - err : ", err);
  }
};

/**
 * title type인 property의 이름이 Name이 아닐 때, property의 이름을 Name으로 바꿔주는 함수.
 * @param notion
 * @param databaseId
 * @param titleTypePropertyId
 */
const updateTitleTypePropertyName = async (
  notion: Client,
  databaseId: string
) => {
  try {
    const response = await notion.databases.update({
      database_id: databaseId,
      properties: {
        title: {
          name: "Name",
        },
      },
    });
  } catch (err) {
    console.log("updateTitleTypePropertyName - err : ", err);
  }
};

/**
 * 기존에 type이 title이 아닌 Property의 이름이 Name이라면 이름을 바꿔준다.
 * @param notion
 * @param databaseId
 * @param nameId
 */
const updateRenameNamePropertyToOther = async (
  notion: Client,
  databaseId: string,
  nameId: string
) => {
  try {
    const date = new Date();
    const response = await notion.databases.update({
      database_id: databaseId,
      properties: {
        [nameId]: { name: "Name" + date.getTime() },
      },
    });
  } catch (err) {
    console.log("updateTitleTypePropertyName - err : ", err);
  }
};

/**
 * database에  Date Property가 없을때 추가해주는 함수.
 * @param databaseId
 * @param name
 * @param startTime
 * @param endTime
 * @param timeZone
 */
const upsertProperties = async (
  notion: Client,
  databaseId: string,
  nullProperty: {
    date?: {
      startTime: string;
      endTime: string;
      timeZone: string;
    };
  }
) => {
  try {
    const properties: any = {};

    // startTime, endTime, timeZone 모두 있을 경우에만 Date 프로퍼티 추가
    if (nullProperty.date) {
      properties.Date = {
        date: {
          start: nullProperty.date.startTime,
          end: nullProperty.date.endTime,
          time_zone: nullProperty.date.timeZone,
        },
      };
    }

    const response = await notion.databases.update({
      database_id: databaseId,
      properties: properties,
    });
  } catch (err) {
    console.log("addProperty - Error : ", err);
  }
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

    const dbInfo = await getDBInfo(
      dbId,
      notionDatabaseInfo[0].notion_info.access_token
    );

    if (!dbInfo) {
      // error handling.
      // dbInfo 가 없다는 건 문제가 있다. DB가 아예 삭제됬을 가능성.
      return;
    }
    // Name이라는 이름의 다른 Property가 있다면, 이를 다른이름으로 바꿔주고 title type의 property의 이름을 Name으로 바꿔줘야 한다.
    for (let item in dbInfo.properties) {
      if (item === "Name") {
        if (dbInfo.properties[item].type !== "title") {
          // type이 title이 아닌 Name Property의 이름을 Name이 아닌 다른걸로 바꿔주기.
          await updateRenameNamePropertyToOther(
            notion,
            dbId,
            dbInfo.properties[item].id
          );
        }
      }
    }

    for (let item in dbInfo.properties) {
      if (dbInfo.properties[item].type === "title") {
        if (item !== "Name") {
          await updateTitleTypePropertyName(notion, dbId);
        }
      }
    }

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
  notion: Client,
  timerId: string,
  pageName: string,
  startTime: string,
  endTime: string
  // timeZone: TimeZone
) => {
  try {
    const timerInfo = await getTimerInfo(timerId);

    if (!timerInfo) {
      // error handling
      // return;

      return {
        success: false,
        err: null,
        pageId: null,
        url: null,
      };
    }

    const notionDatabaseInfo = timerInfo.data[0].notion_database_info;

    if (!notionDatabaseInfo[0].notion_info) {
      // error handling
      // return;
      return {
        success: false,
        err: null,
        pageId: null,
        url: null,
      };
    }

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
            start: startTime,
            end: endTime,
            // time_zone: timeZone,
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

    const pageWithUrl = newPage as typeof newPage & { url: string };

    return {
      success: true,
      err: null,
      pageId: pageWithUrl.id,
      url: pageWithUrl.url,
    };
  } catch (err) {
    return { success: false, err, pageId: null, url: null };
  }
};

export const updatePageDate = async (
  timerId: string,
  pageId: string,
  pageName: string,
  startDate: string,
  endDate: string
  // timeZone: TimeZone
) => {
  // 만약 pageId가 있으면 pageID를 업데이트 하지만, 없다면 새로운 page를 만들어 넣는다.
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

    const page: GetPageResponseWithInTrashAndArchived =
      await notion.pages.retrieve({
        page_id: pageId,
      });

    // page가 존재 할 때. 존재하지 않을때
    const dbInfo = await getDBInfo(
      dbId,
      notionDatabaseInfo[0].notion_info.access_token
    );

    if (!dbInfo) {
      // error handling.
      // dbInfo 가 없다는 건 문제가 있다. DB가 아예 삭제됬을 가능성.
      return;
    }

    // Name이라는 이름의 다른 Property가 있다면, 이를 다른이름으로 바꿔주고 title type의 property의 이름을 Name으로 바꿔줘야 한다.

    // Date 속성이 없거나, 이름은 Date 속성이지만 실제 속성이 date가 아닐때 처리.
    // Date 속성이 없다면 추가해주고, 이름은 Date 속성이지만 실제 속성이 date가 아니면 속성을 변경해준다.

    for (let item in dbInfo.properties) {
      if (item === "Name") {
        if (dbInfo.properties[item].type !== "title") {
          // type이 title이 아닌 Name Property의 이름을 Name이 아닌 다른걸로 바꿔주기.
          await updateRenameNamePropertyToOther(
            notion,
            dbId,
            dbInfo.properties[item].id
          );
        }
      }
    }

    let isDateFlag = false;
    for (let item in dbInfo.properties) {
      if (dbInfo.properties[item].type === "title") {
        if (item !== "Name") {
          await updateTitleTypePropertyName(notion, dbId);
        }
      }
      if (item === "Date") {
        isDateFlag = true;

        if (dbInfo.properties[item].type !== "date") {
          // Date 속성을 date로 업데이트
          await updateDatePropertyType(notion, dbId);
        }
      }
    }

    if (!isDateFlag) {
      await updateDatePropertyType(notion, dbId);
    }

    if (!page || (page.archived && page.in_trash)) {
      // insert
      const { pageId, url, success } = await insertNewPageToDBWithDate(
        notion,
        timerId,
        pageName,
        startDate,
        endDate
        // timeZone
      );

      if (!success) {
        throw new Error();
      }

      await insertHeatmap(
        timerId,
        startDate,
        endDate,
        pageId ? pageId : undefined,
        pageName,
        url ? url : undefined
      );
    } else {
      // update
      const response = await notion.pages.update({
        page_id: pageId,
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
            type: "date",
            date: {
              start: startDate,
              end: endDate,
              // time_zone: timeZone,
            },
          },
        },
      });

      // console.log("response : ", response);

      const responseWithUrl = response as typeof response & { url: string };

      await insertHeatmap(
        timerId,
        startDate,
        endDate,
        pageId,
        pageName,
        responseWithUrl.url
      );
    }

    return { success: true, err: null, property: null };
  } catch (err) {
    if ((err as notionError).body) {
      const errBody = JSON.parse((err as notionError).body);
      if (errBody.status === 404) {
        // pageId가 없을 시 새로 넣음.
        return;
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

/**
 * Notion Database의 Sync를 맞춰주는 함수. (Name Property를 title type으로. Date Property를 datd type으로)
 * @param notionInfoId
 * @param databaseId
 * @returns
 */
export const syncDatabase = async (
  notionInfoId: string,
  databaseId: string
) => {
  const supabase = createClient();
  const user = await getUser();

  try {
    const notionInfo = await supabase
      .from("notion_info")
      .select("id,access_token")
      .eq("user_id", user.id)
      .eq("id", notionInfoId)
      .is("deleted_at", null);

    if (notionInfo.error || !notionInfo.data || notionInfo.data.length === 0) {
      throw Error();
    }

    const accessToken = notionInfo.data[0].access_token;
    const notion = new Client({ auth: accessToken });

    const dbInfo = await getDBInfo(databaseId, accessToken);

    if (!dbInfo) {
      // error handling.
      // dbInfo 가 없다는 건 문제가 있다. DB가 아예 삭제됬을 가능성.
      return;
    }

    // Name이라는 이름의 다른 Property가 있다면, 이를 다른이름으로 바꿔주고 title type의 property의 이름을 Name으로 바꿔줘야 한다.
    // Date 속성이 없거나, 이름은 Date 속성이지만 실제 속성이 date가 아닐때 처리.
    // Date 속성이 없다면 추가해주고, 이름은 Date 속성이지만 실제 속성이 date가 아니면 속성을 변경해준다.
    for (let item in dbInfo.properties) {
      if (item === "Name") {
        if (dbInfo.properties[item].type !== "title") {
          // type이 title이 아닌 Name Property의 이름을 Name이 아닌 다른걸로 바꿔주기.
          await updateRenameNamePropertyToOther(
            notion,
            databaseId,
            dbInfo.properties[item].id
          );
        }
      }
    }

    let isDateFlag = false;
    for (let item in dbInfo.properties) {
      if (dbInfo.properties[item].type === "title") {
        if (item !== "Name") {
          await updateTitleTypePropertyName(notion, databaseId);
        }
      }
      if (item === "Date") {
        isDateFlag = true;

        if (dbInfo.properties[item].type !== "date") {
          // Date 속성을 date로 업데이트
          await updateDatePropertyType(notion, databaseId);
        }
      }
    }

    if (!isDateFlag) {
      await updateDatePropertyType(notion, databaseId);
    }
    return { success: true };
  } catch (err) {
    return { success: false };
  }
};

export const updateTimerTime = async (
  timerId: string,
  workTime: number,
  breakTime: number
) => {
  const supabase = createClient();
  const user = await getUser();
  try {
    const { data, error } = await supabase
      .from("timers")
      .update({ worktime: workTime, breaktime: breakTime })
      .eq("user_id", user.id)
      .eq("id", timerId);

    if (error) {
      throw new Error();
    }

    return { success: true };
  } catch (err) {
    console.log("error : ", err);

    return { success: false };
  }
};

export const updateTimerSound = async (
  timerId: string,
  alarmSoundOn: boolean,
  tickingSoundOn: boolean
) => {
  // 지금은 사운드 온/오프만 받고 있지만 나중에 사운드 종류, 볼륨도 받아야 한다.
  const supabase = createClient();
  const user = await getUser();
  try {
    const { data, error } = await supabase
      .from("timers")
      .update({
        alarm_sound_on: alarmSoundOn,
        ticking_sound_on: tickingSoundOn,
      })
      .eq("user_id", user.id)
      .eq("id", timerId);

    if (error) {
      throw new Error(error.message);
    }
    return { success: true };
  } catch (err) {
    console.log("err in timerAction - updateTimerSound : ", err);
    return { success: false };
  }
};

/**
 * user의 (삭제되지 않은) 첫번째 만들어진 타이머를 가져오는 메서드.
 */
export const getUserFirstTimer = async () => {
  const supabase = createClient();
  const user = await getUser();
  try {
    const { data, error } = await supabase
      .from("timers")
      .select("id")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    throw new Error("err");
  }
};

/**
 * userId를 파라미터로 받아 user의 (삭제되지 않은) 첫번째 만들어진 타이머를 가져오는 메서드.
 */
export const getUserFirstTimerByUserId = async (userId: string) => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("timers")
      .select("id")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    throw new Error("err");
  }
};

/**
 * timerId를 가지고 그 timer와 연결된 userId 반환
 */
export const getUserIdByTimerId = async (timerId: string) => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("timers")
      .select("users(id)")
      .eq("id", timerId)
      .is("deleted_at", null);

    if (error) {
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
};

/**
 * Timer Name Update (Rename)
 * @param timerId
 * @param timerName
 * @returns
 */
export const updateTimerName = async (timerId: string, timerName: string) => {
  const supabase = createClient();
  const user = await getUser();
  try {
    const { data, error } = await supabase
      .from("timers")
      .update({
        name: timerName,
      })
      .eq("user_id", user.id)
      .eq("id", timerId);

    if (error) {
      throw new Error(error.message);
    }
    return { success: true };
  } catch (err) {
    console.log("err in timerAction - updateTimerName : ", err);
    return { success: false };
  }
};

/**
 * softDeleteTimer (진짜 삭제는 아니고 deleted_at에 날짜 넣는거. soft delete)
 * @param timerId
 * @returns
 */
export const softDeleteTimer = async (timerId: string) => {
  const supabase = createClient();
  const user = await getUser();
  try {
    const { data, error } = await supabase
      .from("timers")
      .update({ deleted_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("id", timerId);

    if (error) {
      throw new Error(error.message);
    }
    revalidatePath("/my-timers");
    return { success: true };
  } catch (err) {
    console.log("err in timerAction - deleteTimer : ", err);
    return { success: false };
  }
};

export const insertHeatmap = async (
  timerId: string,
  start: string,
  end: string,
  pageId?: string,
  name?: string,
  url?: string
) => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.from("heatmaps").insert({
      timer_id: timerId,
      start: start,
      end: end,
      name,
      url,
      pageId: pageId,
    });

    if (error) {
      // error handling
      throw new Error();
    }

    return { success: true };
  } catch (err) {
    console.log("err in timerAction - insertHeatmap : ", err);
    return { success: false };
  }
};

export const heatmapNameUpdate = async (
  heatmapId: string,
  name: string,
  timerId: string,
  notionPageId?: string
) => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("heatmaps")
      .update({ name })
      .eq("id", heatmapId)
      .select();

    if (notionPageId) {
      const timerInfo = await getTimerInfo(timerId);

      if (!timerInfo) {
        // error handling
        // return;
        return { success: false };
      }

      const notionDatabaseInfo = timerInfo.data[0].notion_database_info;

      if (!notionDatabaseInfo[0].notion_info) {
        // error handling
        // return;
        return { success: false };
      }

      await notionPageNameUpdate(
        notionDatabaseInfo[0].notion_info.access_token,
        notionPageId,
        name
      );
    }

    return { success: true };
  } catch (err) {
    console.log("err in timerAction - handleHeatmapNameUpdate : ", err);
    return { success: false };
  }
};

export const notionPageNameUpdate = async (
  notionAccessToken: string,
  notionPageId: string,
  name: string
) => {
  try {
    const notion = new Client({
      auth: notionAccessToken,
    });
    const response = await notion.pages.update({
      page_id: notionPageId,
      properties: {
        Name: {
          title: [
            {
              text: {
                content: name,
              },
            },
          ],
        },
      },
    });
    return { success: true };
  } catch (err) {
    console.log("err in timerAction - notionPageNameUpdate : ", err);

    return { success: false };
  }
};
