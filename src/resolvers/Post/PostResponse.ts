import { Field, ObjectType } from "type-graphql";
import { Post } from "../../Entities/Post";
import { CustomError } from "../Error/CustomError";
@ObjectType()
export class PostResponse {
  @Field(() => [CustomError], { nullable: true })
  errors?: CustomError[];

  @Field(() => Post, { nullable: true })
  post?: Post;
}

@ObjectType()
export class PaginatedPostResponse {
  @Field(() => Boolean)
  hasMore: Boolean;

  @Field(() => [Post])
  posts: Post[];
}

@ObjectType()
export class VotingResponse {
  @Field(() => Boolean)
  isSuccess: Boolean;

  @Field(() => Number, { nullable: true })
  newPoint?: number;
}
