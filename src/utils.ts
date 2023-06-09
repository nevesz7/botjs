import { createHash } from "crypto";

export const generateHash = (password: string) => {
  return createHash("sha256").update(password).digest("hex");
};
