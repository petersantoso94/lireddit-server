import { User } from "../Entities/User";
import { Request } from "express";
import { ErrorMessage } from "../enum";

export const IsAuth = async (req: Request): Promise<User> => {
  const userId = req.session!.userId;
  const user = await User.findOne(userId);
  if (!userId || !user) {
    throw Error(ErrorMessage.NotAuthenticated);
  }
  return user;
};
