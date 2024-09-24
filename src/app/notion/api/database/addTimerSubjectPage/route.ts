import { createClient } from "@/utils/supabase/server";
import { Client } from "@notionhq/client";
import { NextRequest, NextResponse } from "next/server";

interface notionError extends Error {
  body: string;
}

export const POST = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const timerId = searchParams.get("timer");
  if (!timerId) {
    // query param으로 들어온 timerId가 없을때 에러 핸들링
    return;
  }
  // req로 들어온 변수들. 디비에 페이지를 추가하는 데 필요한 변수들.
  const reqJson = await req.json();
  const pageName = reqJson.subject;
  const startTime = reqJson.startTime;
  const endTime = reqJson.endTime;
  const timeZone = reqJson.timeZone;

  const supabase = createClient();
  try {
    const timerInfo = await supabase
      .from("timers")
      .select(
        "id,notion_database_info(id,database_id,notion_info(id,access_token))"
      )
      .eq("id", timerId)
      .is("deleted_at", null);
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
        // Tags: {
        //   select: {
        //     name: pageName,
        //   },
        // },
        Date: {
          date: {
            start: startTime,
            end: endTime,
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

    // return NextResponse.json(newPage);
    return NextResponse.json({ success: true });
  } catch (err) {
    const errBody = JSON.parse((err as notionError).body);
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
      return NextResponse.json({
        success: false,
        error: "missingProperty",
        property: messageToArr[0],
      });
    }

    return NextResponse.json({ success: false });
  }
};
