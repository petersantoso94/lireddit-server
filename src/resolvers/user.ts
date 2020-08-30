import {
  Resolver,
  Mutation,
  Arg,
  InputType,
  Field,
  Ctx,
  ObjectType,
  Query,
} from "type-graphql";
import { IContext } from "../types";
import { User } from "../Entities/User";
import argon2 from "argon2";
import { ErrorMessage } from "../enum";

@InputType()
class UserInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class CustomError {
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [CustomError], { nullable: true })
  errors?: CustomError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: IContext) {
    if (!req.session!.userId) {
      return null;
    }
    const me = await em.findOne(User, { id: req.session!.userId });
    return me;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UserInput,
    @Ctx() { em, req }: IContext
  ): Promise<UserResponse> {
    em.clear();
    const { username, password } = options;
    if (username.length <= 2 || password.length <= 2) {
      return {
        errors: [{ message: ErrorMessage.InvalidUsernameOrPassword }],
      };
    }
    const hashedPassword = await argon2.hash(password);
    const newUser = em.create(User, { username, password: hashedPassword });
    try {
      await em.persistAndFlush(newUser);
    } catch (error) {
      if (error.code === "23505" || error.detail.includes("already exists")) {
        // duplicate username
        return {
          errors: [
            {
              message: ErrorMessage.DuplicateUsername,
            },
          ],
        };
      }
    }

    req.session!.userId = newUser.id;
    return { user: newUser };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UserInput,
    @Ctx() { em, req }: IContext
  ): Promise<UserResponse> {
    em.clear();
    const { username, password } = options;
    if (username.length <= 2)
      return { errors: [{ message: ErrorMessage.InvalidUsername }] };
    const user = await em.findOne(User, { username });
    if (!user)
      return {
        errors: [{ message: ErrorMessage.LoginError }],
      };
    const valid = await argon2.verify(user.password, password);

    if (!valid) {
      return {
        errors: [{ message: ErrorMessage.LoginError }],
      };
    }

    req.session!.userId = user.id;

    return {
      user,
    };
  }
}
