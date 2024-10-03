"use server";

import {
  ERROR_SERVER_500,
  ERROR_USER_NOT_AUTHORIZED,
  LOGIN_AGAIN,
} from "@/lib/constant";
import { createClient } from "@/utils/supabase/server";
import { Client } from "@notionhq/client";
import { redirect } from "next/navigation";
import { GetPageResponseWithInTrashAndArchived, TimeZone } from "@/lib/types";
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

  const parseData: {
    success: boolean;
    err: string | undefined;
    data: {
      results: {
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
      }[];
    };
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

  let nameFlag = false;

  let dateFlag = false;

  for (let item in parseData.data.results[0].properties) {
    if (
      item === "Name" &&
      parseData.data.results[0].properties.Name.type === "title"
    ) {
      nameFlag = true;
    }
    if (item === "Date") {
      dateFlag = true;
    }
  }

  if (!nameFlag || !dateFlag) {
    return {
      success: false,
      err: `Could not find sort property with name or id:${
        !nameFlag ? "Name" : ""
      } ${!dateFlag ? "Date" : ""}`,
    };
  }

  const data = parseData.data;

  const todayDate = new Date();
  let minYear = todayDate.getFullYear();
  let maxYear = todayDate.getFullYear();
  let maxCount = 0;

  const results = data.results;

  const mp = new Map<
    string,
    { count: number; object: { name: string; id: string }[] }
  >();
  results.forEach((el) => {
    if (
      !el.properties ||
      !el.properties.Name ||
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
          el.properties.Name &&
          el.properties.Name.title &&
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
              el.properties.Name &&
              el.properties.Name.title &&
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
  startTime: Date,
  endTime: Date,
  timeZone: TimeZone
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
      await insertNewPageToDBWithDate(
        notion,
        timerId,
        pageName,
        startDate,
        endDate,
        timeZone
      );
    } else {
      // update
      const response = await notion.pages.update({
        page_id: pageId,
        properties: {
          // Name: {
          //   title: [
          //     {
          //       text: {
          //         content: pageName,
          //       },
          //     },
          //   ],
          // },
          Date: {
            type: "date",
            date: {
              start: startDate.toISOString(),
              end: endDate.toISOString(),
              time_zone: timeZone,
            },
          },
        },
      });
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
