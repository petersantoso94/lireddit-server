import { ConnectionOptions } from "typeorm";
import { DB_NAME, DB_USER_NAME, DB_PASSWORD, __prod__ } from "../constants";
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
} as ConnectionOptions;
