import { PostInput } from "../resolvers/Post/PostInput";
import { CustomError } from "../resolvers/Error/CustomError";
import { ErrorMessage } from "../enum";

export const IsPostInputValid = (option: PostInput): CustomError | null => {
  const { content, title } = option;
  if (!content)
    return { field: "content", message: ErrorMessage.InvalidContent };
  if (!title) return { field: "title", message: ErrorMessage.InvalidTitle };
  return null;
};
