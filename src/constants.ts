export const __prod__ = process.env.NODE_ENV === "production";
export const PORT = process.env.PORT || 4000;
export const ALLOW_ORIGINS = ["http://localhost:3000"];
export const LOGIN_COOKIE_NAME = "qid";
export const NODEMAILER_ACCOUNT = "pjrqap2gp4et2nye@ethereal.email";
export const NODEMAILER_PASSWORD = "9Xd4geejEUYAa9ftdP";

//#region REDIS
export const FORGOT_PASSWORD_TOKEN_PREFIX_REDIS = "forgot_password";
export const FORGOT_PASSWORD_TOKEN_EXPIRATION_TIME = 3 * 24 * 60 * 60 * 1000;
export const FORGOT_PASSWORD_CALLBACK_URL =
  "http://localhost:3000/change-password";
export const REDIS_SECRET =
  process.env.REDIS_SECRET || "jaiwiejawidjiawjdiawjdiaw";
//#endregion REDIS
