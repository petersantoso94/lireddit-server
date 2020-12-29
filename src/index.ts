import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection, getConnection } from "typeorm";
import typeOrmConf from "./config/typeorm.config";
import { ALLOW_ORIGINS, LOGIN_COOKIE_NAME, PORT, REDIS_SECRET, __prod__ } from "./constants";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/Post/post";
import { UserResolver } from "./resolvers/User/user";
import { IContext } from "./types";

//rerun
const main = async () => {
  // init db connection, id: peter, pass: peter
  await createConnection(typeOrmConf);
  await getConnection().runMigrations();
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
