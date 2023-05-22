import base64url from "base64url";
import { createHmac } from "crypto";

export const get_token = (userId: number, rememberMe: number) => {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };
  const iat = Math.round(new Date().getTime() / 1000);
  let exp;
  if (rememberMe) exp = iat + 604000;
  else exp = iat + 3600;
  const payload = {
    userId: userId,
    iat: iat,
    exp: exp,
  };
  const encodedHeader = base64url.encode(JSON.stringify(header));
  const encodedPayload = base64url.encode(JSON.stringify(payload));
  const secret = "nelson";
  const signature = createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64");
  const encodedSignature = base64url.fromBase64(signature);
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
};
