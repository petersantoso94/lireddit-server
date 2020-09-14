import { Field, InputType } from "type-graphql";
@InputType()
export class UserInputRegister {
  @Field()
  username: string;
  @Field()
  email: string;
  @Field()
  password: string;
}
