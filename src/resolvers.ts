import { UserRepository } from "../src/data-source";
import { User } from "./entities/user.entity";
import { generateHash } from "./utils";
import { CustomError } from "../src/errors";
import { getToken } from "../src/token";
import { AddressRepository } from "../src/data-source";
import { UserInput, UserPayload, PagedUser } from "../src/types";

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

type Page = {
  users: PagedUser[];
  numberOfUsers: number;
  numberOfPages: number;
  currentPage: number;
};

export const resolvers = {
  Query: {
    user: async (_, { id }: { id: number }, ctx: GraphQLContext) => {
      if (!ctx?.id) {
        throw new CustomError("Unauthenticated", 401);
      }
      const dbUser = await UserRepository.findOne({
        where: { id },
        relations: {
          address: true,
        },
      });
      if (!dbUser) {
        throw new CustomError("User not found", 400);
      }
      return dbUser;
    },

    users: async (
      _,
      {
        amount = 10,
        usersToSkip = 0,
      }: { amount?: number; usersToSkip?: number },
      ctx?: GraphQLContext
    ) => {
      if (!ctx?.id) {
        throw new CustomError("Unauthenticated", 401);
      }
      if (amount < 0) {
        throw new CustomError(
          "Amount of users must be greater or equal to 0",
          400
        );
      }

      if (usersToSkip < 0) {
        throw new CustomError(
          "Amount of skipped users must be greater or equal to 0",
          400
        );
      }

      const [users, userCount]: [UserPayload[], number] =
        await UserRepository.findAndCount({
          order: {
            name: "ASC",
          },
          relations: {
            address: true,
          },
          skip: usersToSkip,
          take: amount,
        });

      if (usersToSkip + amount > userCount) {
        throw new CustomError(
          `The sum of users per page and skipped users cannot be greater than total number of users. Total number of users: ${userCount}`,
          400
        );
      }
      const pagesBefore = Math.ceil(usersToSkip / amount);
      const page: Page = {
        users: users.map((users) => ({
          ...users,
          dateOfBirth: users.dateOfBirth.toISOString(),
        })),
        numberOfUsers: userCount,
        numberOfPages:
          pagesBefore + Math.ceil((userCount - usersToSkip) / amount),
        currentPage: pagesBefore + 1,
      };
      return page;
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
