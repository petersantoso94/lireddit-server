import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { LessThan, MoreThan } from "typeorm";
import { Post } from "../../Entities/Post";
import { Vote } from "../../Entities/Vote";
import { IContext } from "../../types";
import { GetAuthenticateUser } from "../../utils/GetAuthenticateUser";
import { IsPostInputValid } from "../../utils/IsPostInputValid";
import { PostInput } from "./PostInput";
import { PaginatedPostResponse, PostResponse } from "./PostResponse";

@Resolver()
export class PostResolver {
  @Query(() => PaginatedPostResponse)
  async getPosts(
    @Arg("limit") limit: number,
    @Arg("cursor", { nullable: true }) cursor: number
  ): Promise<PaginatedPostResponse> {
    // if return 21, that means still have some post next
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;
    const post = await Post.find({
      relations: ["user"],
      where: {
        id: cursor ? LessThan(cursor) : MoreThan(-1),
      },
      order: { id: "DESC" },
      take: realLimitPlusOne,
    });

    return {
      posts: post.slice(0, realLimit),
      hasMore: realLimitPlusOne === post.length,
    };
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

  @Mutation(() => Boolean)
  async vote(
    @Arg("postId") postId: number,
    @Arg("isUpvote") isUpvote: boolean,
    @Ctx() { req }: IContext
  ): Promise<Boolean> {
    const user = await GetAuthenticateUser(req);
    const post = await Post.findOne(postId);
    if (!post) {
      // post not found
      return false;
    }

    const vote = await Vote.find({
      where: {
        post: post,
        up: isUpvote,
        user: user,
      },
    });
    console.log(vote);
    if (vote.length > 0) {
      // duplicate upvote
      return false;
    }

    // create new vote
    const newVote = new Vote();
    newVote.user = user;
    newVote.post = post;
    newVote.up = isUpvote;
    await newVote.save();

    // update post's points
    post.point += isUpvote ? 1 : -1;
    post.save();

    // return true if all processes are complete
    return true;
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
