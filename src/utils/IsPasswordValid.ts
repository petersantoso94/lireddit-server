export const IsPasswordValid = (password: string): boolean => {
  return new RegExp(/^[\w!@#$%<>?]{3,25}$/).test(password);
};
