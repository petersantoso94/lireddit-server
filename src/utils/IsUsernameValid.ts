export const IsUsernameValid = (username: string): boolean => {
  return new RegExp(/^[\w]+$/).test(username);
};
