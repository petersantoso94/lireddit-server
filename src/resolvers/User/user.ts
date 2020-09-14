import argon2 from "argon2";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { LOGIN_COOKIE_NAME } from "../../constants";
import { User } from "../../Entities/User";
import { ErrorMessage } from "../../enum";
import { IContext } from "../../types";
import { UserInputRegister } from "./UserInputRegister";
import { UserResponse } from "./UserResponse";
import { validateRegister } from "../../utils/validateRegister";
import { IsUsernameValid } from "../../utils/IsUsernameValid";

@Resolver()
export class UserResolver {
  @Mutation(() => Boolean)
  async forgotPassword() {}

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
    @Arg("options") options: UserInputRegister,
    @Ctx() { em, req }: IContext
  ): Promise<UserResponse> {
    em.clear();
    const errors = validateRegister(options);
    if (errors.length > 0) return { errors };
    const { username, email, password } = options;
    const hashedPassword = await argon2.hash(password);
    const newUser = em.create(User, {
      username,
      email,
      password: hashedPassword,
    });
    try {
      await em.persistAndFlush(newUser);
    } catch (error) {
      if (error.code === "23505" || error.detail.includes("already exists")) {
        // duplicate username
        return {
          errors: [
            {
              message: ErrorMessage.DuplicateUsername,
              field: "username",
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
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: IContext
  ): Promise<UserResponse> {
    em.clear();
    if (usernameOrEmail.length <= 2)
      return {
        errors: [{ message: ErrorMessage.InvalidUsername, field: "username" }],
      };
    const user = await em.findOne(
      User,
      IsUsernameValid(usernameOrEmail)
        ? { username: usernameOrEmail }
        : { email: usernameOrEmail }
    );
    if (!user)
      return {
        errors: [
          { message: ErrorMessage.LoginError, field: "usernameOrEmail" },
        ],
      };
    const valid = await argon2.verify(user.password, password);

    if (!valid) {
      return {
        errors: [
          { message: ErrorMessage.LoginError, field: "usernameOrEmail" },
        ],
      };
    }

    req.session!.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: IContext) {
    res.clearCookie(LOGIN_COOKIE_NAME);
    return new Promise((resolve) =>
      req.session?.destroy((err) => {
        if (err) {
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}
