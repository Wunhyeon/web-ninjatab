import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  // if "next" is in param, use it as the redirect URL
  //   const next = searchParams.get("next") ?? "/";
  const next = "/";
  console.log("code : ", code);

  if (code) {
    const clientId = process.env.NOTION_OAUTH_CLIENT_ID;
    const clientSecret = process.env.NOTION_OAUTH_CLIENT_SECRET;
    const redirectUri = process.env.NOTION_OAUTH_REDIRECT_URI;

    // encode in base 64
    const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );

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

    console.log("clientId : ", clientId);
    console.log("clientSecret : ", clientSecret);
    console.log("redirectUri : ", redirectUri);
    console.log("encoded : ", encoded);

    console.log("response : ", response);
    console.log("response : ", await response.json());

    // if (!error) {
    //   return NextResponse.redirect(`${origin}${next}`);
    // }

    const supabase = createClient();
    const user = await supabase.auth.getUser();

    console.log("@@@@@ callbackroute - user : ", user.data.user?.id);
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
