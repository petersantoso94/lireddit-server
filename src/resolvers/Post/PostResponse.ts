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