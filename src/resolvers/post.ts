import { Resolver, Query, Ctx } from "type-graphql";
import { IContext } from "src/types";
import { Post } from "../Entities/Post";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: IContext): Promise<Post[]> {
    return em.find(Post, {});
  }
}
