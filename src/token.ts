import { sign } from "jsonwebtoken";

export const getToken = (user, rememberMe: boolean) => {
  const secret = "nelson";
  let token: string;
  if (rememberMe === false) {
    token = sign(user, secret, { expiresIn: 3600 });
  } else {
    token = sign(user, secret, { expiresIn: 604000 });
  }
  return token;
};
