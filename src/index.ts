import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import typeOrmConf from "./config/typeorm.config";
import {
  ALLOW_ORIGINS,
  LOGIN_COOKIE_NAME,
  PORT,
  REDIS_SECRET,
  __prod__,
} from "./constants";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/User/user";
import { IContext } from "./types";

const main = async () => {
  //sendMail({ html: "<b>test</b>", to: ["test@test.com"] });
  // init db connection
  await createConnection(typeOrmConf);
  //const orm = MikroORM.init(mikroConf);
  //await (await orm).getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();
  app.use(
    cors({
      origin: ALLOW_ORIGINS,
      credentials: true,
    })
  );
  app.use(
    session({
      name: LOGIN_COOKIE_NAME,
      store: new RedisStore({ client: redis, disableTouch: true }),
      secret: REDIS_SECRET,
      resave: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
        httpOnly: true,
        secure: __prod__,
        sameSite: "lax",
      },
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: async ({ req, res }): Promise<IContext> => ({
      req,
      res,
      redis,
    }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.get("/", (_, res) => {
    res.send("ok");
  });
  app.listen(PORT, () => {
    console.log(`Running server on ${PORT}`);
  });
};

main().catch((err) => {
  console.error(err);
});
