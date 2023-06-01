import { sign } from "jsonwebtoken";

export const getToken = (user, rememberMe: boolean) => {
  let token: string;
  const secret = process.env.SECRET;
  const payload = {
    name: user.name,
    id: user.id,
    email: user.email,
    profession: user.profession,
    dateOfBirth: user.dateOfBirth,
  };

  if (rememberMe === false) {
    token = sign(payload, secret, { expiresIn: 3600 });
  } else {
    token = sign(payload, secret, { expiresIn: 604800 });
  }
  return token;
};
