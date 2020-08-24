import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./Entities/Post";
import mikroConf from "./mikro-orm.config";

const main = async () => {
  const orm = MikroORM.init(mikroConf);
  await (await orm).getMigrator().up();
  const post = (await orm).em.create(Post, { title: "my first post" });
  await (await orm).em.persistAndFlush(post);

  const posts = await (await orm).em.find(Post, {});
  console.log(posts);
};

main().catch((err) => {
  console.error(err);
});
