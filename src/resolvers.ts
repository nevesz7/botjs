import { UserRepository } from "../src/data-source";
import { User } from "./entities/user.entity";
import { createHash } from "crypto";
import { CustomError } from "../src/errors";
import { getToken } from "../src/token";
import { SimpleConsoleLogger } from "typeorm";

const isValidPassword = (str: string) => {
  return /(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}/.test(str);
};

type UserInterface = {
  name: string;
  email: string;
  id: number;
};

type InsertUserInput = {
  name: string;
  email: string;
  password: string;
  dateOfBirth: Date;
  profession: string;
};

type LoginInfo = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export const resolvers = {
  Query: {
    users: () => {
      return "Hello, Taqos!";
    },
    user: async (_, { id }: { id: number }, ctx: UserInterface) => {
      console.log(typeof id);
      if (ctx === null) {
        throw new CustomError("Invalid Token", 401);
      }
      const dbUser = await UserRepository.findOne({ where: { id } });
      if (!dbUser) {
        throw new CustomError("User not found", 400);
      }
      return dbUser;
    },
  },

  Mutation: {
    insertUser: async (
      _,
      { requestData }: { requestData: InsertUserInput },
      ctx: UserInterface
    ) => {
      if (ctx === null) {
        throw new CustomError("Unauthenticated", 401);
      }
      const existingUser = await UserRepository.findOne({
        where: { email: requestData.email },
      });

      if (!isValidPassword(requestData.password)) {
        throw new CustomError(
          "A senha deve conter pelo menos 8 caracteres. Entre eles ao menos: uma letra maiúscula, uma letra minúscula e um número.",
          400,
          "A senha não satisfaz a política de senha!"
        );
      }
      if (existingUser) {
        throw new CustomError(
          "Já existe um usuário cadastrado com este email, favor utilize outro!",
          409,
          "Email já existente na base de dados"
        );
      }
      const hash = createHash("sha256")
        .update(requestData.password)
        .digest("hex");
      const newUser = new User();
      newUser.name = requestData.name;
      newUser.email = requestData.email;
      newUser.password = hash;
      newUser.dateOfBirth = new Date(requestData.dateOfBirth);
      newUser.profession = requestData.profession;
      const savedUser = await UserRepository.save(newUser);
      return {
        ...savedUser,
        dateOfBirth: savedUser.dateOfBirth.toISOString(),
      };
    },

    login: async (
      _,
      { requestCredentials }: { requestCredentials: LoginInfo }
    ) => {
      const existingUser = await UserRepository.findOne({
        where: { email: requestCredentials.email },
      });
      if (!existingUser) {
        throw new CustomError(
          "Email não encontrado na base de dados, tente novamente.",
          404
        );
      }
      const { password, ...returnableUser } = existingUser;
      const hash = createHash("sha256")
        .update(requestCredentials.password)
        .digest("hex");
      if (password != hash) {
        throw new CustomError("Senha inválida!", 403);
      }
      const data = {
        user: returnableUser,
        token: getToken(returnableUser, requestCredentials.rememberMe),
      };
      return data;
    },
  },
};
