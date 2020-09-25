import { GetAuthenticateUser } from "../../utils/GetAuthenticateUser";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { Post } from "../../Entities/Post";
import { IContext } from "../../types";
import { PostInput } from "./PostInput";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(): Promise<Post[]> {
    return Post.find();
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  async createPost(
    @Arg("option") option: PostInput,
    @Ctx() { req }: IContext
  ): Promise<Post> {
    const user = await GetAuthenticateUser(req);
    let newPost = Post.create({ ...option });
    newPost.user = user;
    return newPost.save();
  }

  @Mutation(() => Post)
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) return null;
    if (typeof title !== "undefined") {
      await Post.update({ id }, { title });
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    const post = await Post.findOne(id);
    if (!post) return false;
    await Post.delete(id);
    return true;
  }
}
