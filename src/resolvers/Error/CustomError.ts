import { Field, ObjectType } from "type-graphql";
@ObjectType()
export class CustomError {
  @Field()
  message: string;
  @Field()
  field: string;
}
