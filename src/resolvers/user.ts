import { Resolver, Mutation, Arg, InputType, Field, Ctx } from "type-graphql";
import { IContext } from "src/types";
import { User } from "../Entities/User";
import argon2 from "argon2";

@InputType()
class UserInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(@Arg("options") options: UserInput, @Ctx() { em }: IContext) {
    em.clear();
    const { username, password } = options;
    const hashedPassword = await argon2.hash(password);
    const newUser = em.create(User, { username, password: hashedPassword });
    await em.persistAndFlush(newUser);
    return newUser;
  }
}
