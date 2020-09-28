import { GetAuthenticateUser } from "../../utils/GetAuthenticateUser";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { Post } from "../../Entities/Post";
import { IContext } from "../../types";
import { PostInput } from "./PostInput";
import { PostResponse } from "./PostResponse";
import { IsPostInputValid } from "../../utils/IsPostInputValid";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return Post.find({ relations: ["user"] });
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id, { relations: ["user"] });
  }

  @Mutation(() => PostResponse)
  async createPost(
    @Arg("option") option: PostInput,
    @Ctx() { req }: IContext
  ): Promise<PostResponse> {
    const user = await GetAuthenticateUser(req);
    const errors = IsPostInputValid(option);
    if (errors && errors.length > 0) return { errors };
    let newPost = Post.create({ ...option });
    newPost.user = user;
    await newPost.save();
    return { post: newPost };
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
