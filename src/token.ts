// import * as dotenv from "dotenv";
import { sign } from "jsonwebtoken";

export const getToken = (user, rememberMe: boolean) => {
  const secret = process.env.SECRET;
  let token: string;
  if (rememberMe === false) {
    token = sign(user, secret, { expiresIn: 1000 });
  } else {
    token = sign(user, secret, { expiresIn: 100000 });
  }
  return token;
};
