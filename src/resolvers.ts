import { UserRepository } from "../src/data-source";
import { User } from "./entities/user.entity";
import { createHash } from "crypto";
import { CustomError } from "../src/errors";

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

type LoginInfo = {
  email: string;
  password: string;
};

export const resolvers = {
  Query: {
    users: () => {
      return "Hello, Taqos!";
    },
  },
  Mutation: {
    insertUser: async (_, { requestData }: { requestData: UserInput }) => {
      const existingUser = await UserRepository.findOneBy({
        email: requestData.email,
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
      const existingUser = await UserRepository.findOneBy({
        email: requestCredentials.email,
      });
      if (!existingUser) {
        throw new Error("Email não encontrado!");
      }
      console.log(requestCredentials.password);
      const hash = createHash("sha256")
        .update(requestCredentials.password)
        .digest("hex");
      console.log(hash);
      console.log(existingUser.password);
      if (existingUser.password != hash) {
        throw new Error("Senha inválida!");
      }
      const user_dateOfBirth = new Date(existingUser.dateOfBirth);
      const data = {
        user: {
          profession: existingUser.profession,
          name: existingUser.name,
          email: existingUser.email,
          dateOfBirth: user_dateOfBirth,
          id: existingUser.id,
        },
        token: "the_token",
      };
      return data;
    },
  },
};
