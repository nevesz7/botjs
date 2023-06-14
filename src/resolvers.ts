import { UserRepository } from "../src/data-source";
import { User } from "./entities/user.entity";
import { generateHash } from "./utils";
import { CustomError } from "../src/errors";
import { getToken } from "../src/token";
import { UserInput, UserPayload } from "../src/types";

const isValidPassword = (str: string) => {
  return /(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}/.test(str);
};

type GraphQLContext = {
  id: number;
};

type LoginInfo = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export const resolvers = {
  Query: {
    user: async (_, { id }: { id: number }, ctx: GraphQLContext) => {
      if (!ctx?.id) {
        throw new CustomError("Unauthenticated", 401);
      }
      const dbUser = await UserRepository.findOne({ where: { id } });
      if (!dbUser) {
        throw new CustomError("User not found", 400);
      }
      return dbUser;
    },

    users: async (
      _,
      { amount = 10 }: { amount?: number },
      ctx?: GraphQLContext
    ) => {
      if (!ctx?.id) {
        throw new CustomError("Unauthenticated", 401);
      }
      if (amount <= 0) {
        throw new CustomError("Amount of users must be greater than 0", 400);
      }

      const userArray: UserPayload[] = await UserRepository.find({
        order: {
          name: "ASC",
        },
        skip: 0,
        take: amount,
      });

      return userArray.map((userArray) => ({
        ...userArray,
        dateOfBirth: userArray.dateOfBirth.toISOString(),
      }));
    },
  },

  Mutation: {
    insertUser: async (
      _,
      { requestData }: { requestData: UserInput },
      ctx: GraphQLContext
    ) => {
      if (!ctx?.id) {
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
      const hash = generateHash(requestData.password);
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
      const hash = generateHash(requestCredentials.password);
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
