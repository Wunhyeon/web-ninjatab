export const LOGIN_AGAIN = "please_login_again";
export const LOGIN_AGAIN_MESSAGE =
  "To proceed with this action, permission is required. It seems that you are either not logged in or your session has expired. We kindly ask you to log in again.";

// export const NOTION_AUTHORIZATION_URL =
// "https://api.notion.com/v1/oauth/authorize?client_id=9107fddb-ff77-47f7-98c9-e9cc68c19640&response_type=code&owner=user&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback%2Fnotion";
export const NEXT_PUBLIC_NOTION_AUTHORIZATION_URL =
  process.env.NEXT_PUBLIC_NOTION_AUTHORIZATION_URL;

export const ERROR_USER_NOT_AUTHORIZED = "user not authorized";
export const ERROR_SERVER_500 = "server error";

// export const ORIGIN = "https://pomolog.site";
export const ORIGIN =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://pomolog.site";
