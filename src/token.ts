import * as dotenv from "dotenv";
import { sign } from "jsonwebtoken";

dotenv.config({ path: "../bot.taq/.env" });
const secret = process.env.SECRET;

export const getToken = (user, rememberMe: boolean) => {
  let token: string;
  if (rememberMe === false) {
    token = sign(user, secret, { expiresIn: 3600 });
  } else {
    token = sign(user, secret, { expiresIn: 604800 });
  }
  return token;
};
