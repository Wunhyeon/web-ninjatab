import { LOGIN_AGAIN } from "@/lib/constant";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions

// Notion 연결 Callback 처리하는 부분!!!

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  // if "next" is in param, use it as the redirect URL
  //   const next = searchParams.get("next") ?? "/";
  const next = "/";

  if (code) {
    const clientId = process.env.NOTION_OAUTH_CLIENT_ID;
    const clientSecret = process.env.NOTION_OAUTH_CLIENT_SECRET;
    const redirectUri = process.env.NOTION_OAUTH_REDIRECT_URI;

    // encode in base 64
    const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );
    try {
      const response = await fetch("https://api.notion.com/v1/oauth/token", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Basic ${encoded}`,
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code: `${code}`,
          redirect_uri: redirectUri,
        }),
      });

      const responseJson = await response.json();

      // if (!error) {
      //   return NextResponse.redirect(`${origin}${next}`);
      // }

      // if (responseJson.owner.type != "user") {
      //   // 개인유저가 아니라면 법인이나 이런 걸 껀데, 이거 처리해줘야함. <- 법인 유저도 어차피 개인 로그인 아이디를 가지고 있으므로, 제한해줄 필요X 2024.10.15
      //   return NextResponse.redirect(
      //     `${origin}/notion-connect?success=false&message=onlyPersonalUser`
      //   );
      // }

      const supabase = createClient();
      const user = await supabase.auth.getUser();

      if (!user.data.user) {
        return NextResponse.redirect(
          `${origin}/please-login?message=${LOGIN_AGAIN}`
        );
      }

      const notionInfoByWorkspaceId = await supabase
        .from("notion_info")
        .select("id")
        .eq("user_id", user.data.user.id)
        .eq("workspace_id", responseJson.workspace_id)
        .is("deleted_at", null);

      // 기존에 workspaceId가 겹치는 게 없다면 notionInfo를 저장하고, 있다면 update해준다!!!
      if (
        notionInfoByWorkspaceId.data &&
        notionInfoByWorkspaceId.data.length > 0
      ) {
        // 기존에 workspaceId가 겹치는 notionInfo가 있다면 업데이트
        const { data, error } = await supabase
          .from("notion_info")
          .update({
            access_token: responseJson.access_token,
            token_type: responseJson.token_type,
            bot_id: responseJson.bot_id,
            workspace_name: responseJson.workspace_name,
          })
          .eq("user_id", user.data.user.id)
          .eq("workspace_id", responseJson.workspace_id);

        if (error) {
          // error handling
          return NextResponse.redirect(
            `${origin}/notion-connect?success=false&message=server-error`
          );
        }
      } else {
        // 기존에 workspaceIdrk 겹치는 notionInfo가 없다면 인서트. 혹시모르니 걍 upsert로 해줌.
        const { data, error } = await supabase.from("notion_info").upsert({
          access_token: responseJson.access_token,
          token_type: responseJson.token_type,
          bot_id: responseJson.bot_id,
          workspace_id: responseJson.workspace_id,
          workspace_name: responseJson.workspace_name,
          user_id: user.data.user?.id,
        });

        if (error) {
          // error handling
          return NextResponse.redirect(
            `${origin}/notion-connect?success=false&message=server-error`
          );
        }
      }
    } catch (err) {
      return NextResponse.redirect(
        `${origin}/notion-connect?success=false&message=server-error`
      );
    }

    return NextResponse.redirect(`${origin}/notion-connect?success=true`);
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
