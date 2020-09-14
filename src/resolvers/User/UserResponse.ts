import { Field, ObjectType } from "type-graphql";
import { User } from "../../Entities/User";
import { CustomError } from "./CustomError";
@ObjectType()
export class UserResponse {
  @Field(() => [CustomError], { nullable: true })
  errors?: CustomError[];

  @Field(() => User, { nullable: true })
  user?: User;
}
