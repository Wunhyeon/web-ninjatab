"use server";

import {
  ERROR_SERVER_500,
  ERROR_USER_NOT_AUTHORIZED,
  LOGIN_AGAIN,
} from "@/lib/constant";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

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
 * edit-timer에서 사용할 것
 * @returns timer의 모든 정보, notion_database_info의 id, database_name. 그리고 workspace등의 id를 저장한 notion_info_id
 */
export const getTimerInfo = async (timerId: string) => {
  // edit-timer 에서 사용할 것
  const supabase = createClient();

  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error(JSON.stringify({ statusCode: 401 }));
    }
    const { data, error } = await supabase
      .from("timers")
      .select("*, notion_database_info(id,database_name, notion_info_id)")
      .eq("id", timerId)
      .eq("user_id", user.data.user.id);
  } catch (err) {}
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
