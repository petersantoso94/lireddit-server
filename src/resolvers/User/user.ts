import argon2 from "argon2";
import { IsPasswordValid } from "../../utils/IsPasswordValid";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { v4 } from "uuid";
import {
  FORGOT_PASSWORD_CALLBACK_URL,
  FORGOT_PASSWORD_TOKEN_EXPIRATION_TIME,
  FORGOT_PASSWORD_TOKEN_PREFIX_REDIS,
  LOGIN_COOKIE_NAME,
} from "../../constants";
import { User } from "../../Entities/User";
import { ErrorMessage } from "../../enum";
import { IContext } from "../../types";
import { IsUsernameValid } from "../../utils/IsUsernameValid";
import { getForgotPasswordEmailBody, sendMail } from "../../utils/sendMail";
import { validateRegister } from "../../utils/validateRegister";
import { UserInputRegister } from "./UserInputRegister";
import { UserResponse } from "./UserResponse";

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { em, redis, req }: IContext
  ): Promise<UserResponse> {
    em.clear();
    if (!IsPasswordValid(newPassword)) {
      return {
        errors: [
          { field: "newPassword", message: ErrorMessage.InvalidPassword },
        ],
      };
    }
    const userId = await redis.get(
      `${FORGOT_PASSWORD_TOKEN_PREFIX_REDIS}${token}`
    );
    if (!userId) {
      return {
        errors: [{ field: "token", message: ErrorMessage.TokenExpired }],
      };
    }
    const user = await em.findOne(User, { id: parseInt(userId) });
    if (!user) {
      return {
        errors: [{ field: "token", message: ErrorMessage.UserNotFound }],
      };
    }
    //update the password
    user.password = await argon2.hash(newPassword);
    await em.persistAndFlush(user);

    //login user after reset
    req.session!.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { em, redis }: IContext
  ) {
    em.clear();
    const user = await em.findOne(User, { email });
    if (!user) {
      // email not found, dont send anything
      return true;
    }
    const token = v4();
    // set the token in redis for 3 days
    await redis.set(
      FORGOT_PASSWORD_TOKEN_PREFIX_REDIS + token,
      user.id,
      "ex",
      FORGOT_PASSWORD_TOKEN_EXPIRATION_TIME
    );
    sendMail({
      to: [email],
      html: getForgotPasswordEmailBody(
        `${FORGOT_PASSWORD_CALLBACK_URL}`,
        token
      ),
    });
    return true;
  }

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
