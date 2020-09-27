import { PostInput } from "../resolvers/Post/PostInput";
import { CustomError } from "../resolvers/Error/CustomError";
import { ErrorMessage } from "../enum";

export const IsPostInputValid = (option: PostInput): CustomError[] | null => {
  const { content, title } = option;
  let errorList: CustomError[] = [];
  if (!content)
    errorList.push({ field: "content", message: ErrorMessage.InvalidContent });
  if (!title)
    errorList.push({ field: "title", message: ErrorMessage.InvalidTitle });
  return errorList;
};
