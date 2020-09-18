export const IsUsernameValid = (username: string): boolean => {
  return new RegExp(/^[\w]{3,25}$/).test(username);
};
