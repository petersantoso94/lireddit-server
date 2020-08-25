import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__, PORT } from "./constants";
import mikroConf from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";

const main = async () => {
  // init db connection
  const orm = MikroORM.init(mikroConf);
  await (await orm).getMigrator().up();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false,
    }),
    context: async () => ({ em: (await orm).em }),
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
