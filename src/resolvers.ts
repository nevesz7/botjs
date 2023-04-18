import { AppDataSource } from "./data-source";
import { user } from "./entities/user.entity";
import { createHash } from "crypto";

const UserRepository = AppDataSource.getRepository(user);

const isValidPassword = (str) => {
  return /[a-zA-Z\d]{8,}/.test(str);
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
    users: () => "Hello Taqos!",
  },
  Mutation: {
    insertUser: async (_, { requestData }: { requestData: UserInput }) => {
      const existingUser = await UserRepository.findOneBy({
        email: requestData.email,
      });
      if (existingUser) {
        throw new Error(
          "Já existe um usuário cadastrado com este email, favor utilize outro!"
        );
      }
      if (!isValidPassword(requestData.password)) {
        throw new Error(
          "A senha deve conter pelo menos 8 caracteres. Entre eles ao menos: uma letra maiúscula, uma letra minúscula, um número."
        );
      }
      const hash = createHash("sha256")
        .update(requestData.password)
        .digest("hex");
      const newUser = new user();
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
