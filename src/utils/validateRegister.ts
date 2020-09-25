import { CustomError } from "../resolvers/User/CustomError";
import { ErrorMessage } from "../enum";
import { UserInputRegister } from "../resolvers/User/UserInputRegister";
import { IsEmailValid } from "./IsEmailValid";
import { IsUsernameValid } from "./IsUsernameValid";
import { IsPasswordValid } from "./IsPasswordValid";

export const validateRegister = (options: UserInputRegister): CustomError[] => {
  const { username, email, password } = options;
  if (!IsEmailValid(email)) {
    return [{ message: ErrorMessage.InvalidEmail, field: "email" }];
  }

  if (username.length <= 2 || !IsUsernameValid(username)) {
    return [{ message: ErrorMessage.InvalidUsername, field: "username" }];
  }
  if (!IsPasswordValid(password)) {
    return [{ message: ErrorMessage.InvalidPassword, field: "password" }];
  }
  return [];
};
