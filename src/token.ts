import { sign } from "jsonwebtoken";

export const getToken = (user, rememberMe: boolean) => {
  let token: string;
  const secret = process.env.SECRET;
  if (rememberMe === false) {
    token = sign(user, secret, { expiresIn: 3600 });
  } else {
    token = sign(user, secret, { expiresIn: 604800 });
  }
  return token;
};
