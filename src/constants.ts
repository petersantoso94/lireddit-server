export const __prod__ = process.env.NODE_ENV === "production";
export const PORT = process.env.PORT || 4000;
export const ALLOW_ORIGINS = ["http://localhost:3000"];
export const LOGIN_COOKIE_NAME = "qid";
export const REDIS_SECRET =
  process.env.REDIS_SECRET || "jaiwiejawidjiawjdiawjdiaw";
