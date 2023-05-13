import { UserRepository } from "../src/data-source";
import { User } from "./entities/user.entity";
import { createHash } from "crypto";
import { CreateUserError } from "../src/errors";

const isValidPassword = (str) => {
  return /(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}/.test(str);
};

type UserInput = {
  name: string;
  email: string;
  password: string;
  date_of_birth: string;
  profession: string;
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
        throw new CreateUserError(
          "A senha deve conter pelo menos 8 caracteres. Entre eles ao menos: uma letra maiúscula, uma letra minúscula e um número.",
          400,
          "A senha não satisfaz a política de senha!"
        );
      }

      if (existingUser) {
        throw new CreateUserError(
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
      newUser.date_of_birth = new Date(requestData.date_of_birth);
      newUser.profession = requestData.profession;
      const savedUser = await UserRepository.save(newUser);
      return {
        ...savedUser,
        date_of_birth: savedUser.date_of_birth.toISOString(),
      };
    },
  },
};
