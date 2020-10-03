import path from "path";
import { ConnectionOptions } from "typeorm";
import { DB_NAME, DB_PASSWORD, DB_USER_NAME, __prod__ } from "../constants";
import { Post } from "../Entities/Post";
import { User } from "../Entities/User";

export default {
  type: "postgres",
  database: DB_NAME,
  username: DB_USER_NAME,
  password: DB_PASSWORD,
  logging: !__prod__,
  synchronize: !__prod__,
  entities: [Post, User],
  migrations: [path.join(__dirname, "../migration/*")],
} as ConnectionOptions;
