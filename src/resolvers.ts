import { UserRepository } from "../src/data-source";
import { User } from "./entities/user.entity";
import { createHash } from "crypto";
import { CustomError } from "../src/errors";
import { verify } from "jsonwebtoken";
import { getToken } from "../src/token";

const isValidPassword = (str) => {
  return /(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}/.test(str);
};

type UserInput = {
  name: string;
  email: string;
  password: string;
  dateOfBirth: string;
  profession: string;
};

type Input = {
  userInput: UserInput;
  token: string;
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
  },
  Mutation: {
    insertUser: async (_, { requestData }: { requestData: Input }) => {
      try {
        const test = verify(requestData.token, process.env.SECRET) as Omit<
          User,
          "password"
        >;
        const dbUser = await UserRepository.findOneBy({
          id: test.id,
        });
        if (!dbUser) throw new CustomError("test error", 777);
        console.log(test);
      } catch (error) {
        console.log(error.message);
        throw new CustomError("test error", 777);
      }
      const existingUser = await UserRepository.findOneBy({
        email: requestData.userInput.email,
      });

      if (!isValidPassword(requestData.userInput.password)) {
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
        .update(requestData.userInput.password)
        .digest("hex");
      const newUser = new User();
      newUser.name = requestData.userInput.name;
      newUser.email = requestData.userInput.email;
      newUser.password = hash;
      newUser.dateOfBirth = new Date(requestData.userInput.dateOfBirth);
      newUser.profession = requestData.userInput.profession;
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
      const existingUser = await UserRepository.findOneBy({
        email: requestCredentials.email,
      });
      if (!existingUser) {
        throw new CustomError(
          "Email não encontrado na base de dados, tente novamente.",
          404
        );
      }
      const removeProp = "password";
      const { [removeProp]: password, ...returnableUser } = existingUser;
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
