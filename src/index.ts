import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__, PORT, REDIS_SECRET } from "./constants";
import mikroConf from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { IContext } from "./types";

const main = async () => {
  // init db connection
  const orm = MikroORM.init(mikroConf);
  await (await orm).getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    session({
      name: "qid",
      store: new RedisStore({ client: redisClient, disableTouch: true }),
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
      em: (await orm).em,
      req,
      res,
    }),
  });

  apolloServer.applyMiddleware({ app });

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
