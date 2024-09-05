import { LOGIN_AGAIN } from "@/lib/constant";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import {
  DatabaseObjectResponse,
  PartialDatabaseObjectResponse,
  SearchResponse,
} from "@notionhq/client/build/src/api-endpoints";

export async function GET(request: NextRequest) {
  // notionInfo Id를 받아 정보를 받아 그 안에 있는 accessToken을 가지고 노션 api에 database 목록을 요청해야한다.
  const searchParams = request.nextUrl.searchParams;
  const notionInfoId = searchParams.get("notionInfoId");
  console.log("NotionInfoId : ", notionInfoId);

  if (!notionInfoId) {
    return NextResponse.json({
      success: false,
      err: { message: "bad request" },
    });
  }

  const supabase = createClient();
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      return NextResponse.redirect(`/please-login?message=${LOGIN_AGAIN}`);
    }
    const { data, error } = await supabase
      .from("notion_info")
      .select("access_token")
      .eq("user_id", user.data.user.id)
      .eq("id", notionInfoId);
    if (error) {
      throw new Error(error.message);
    }

    console.log("data : ", data);

    const notion = new Client({ auth: data[0].access_token });

    const res = await notion.search({
      filter: {
        value: "database",
        property: "object",
      },
    });

    // res.results.forEach((el) => console.log("el : ", el));

    const databaseList = (res.results as DatabaseObjectResponse[]).map((el) => {
      return { id: el.id, title: el.title[0].plain_text };
    });
    console.log("databaseList : ", databaseList);

    // const accessToken = data[]
    return NextResponse.json({ success: true, databaseList: databaseList });
  } catch (err) {
    return NextResponse.json({ success: false, err });
  }
}
