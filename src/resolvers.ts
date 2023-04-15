import { AppDataSource } from "./data-source";
import { User } from "./entities/user";
import { Return-user } from "./entities/returnUser";
import { createHash } from "crypto";

const UserRepository = AppDataSource.getRepository(User);

const isValidPassword = (str) => {
  return /[a-zA-Z\d]{8,}/.test(str);
};

type UserInput = {
  name: string;
  email: string;
  password: string;
  age: number;
  profession: string;
};

export const resolvers = {
  Query: {
    users: () => "Hello Taqos!",
  },
  Mutation: {
    insertUser: async (_, { myUser }: { myUser: UserInput }) => {
      const existingUser = await UserRepository.findOneBy({
        email: myUser.email,
      });
      if (existingUser) {
        throw new Error(
          "Já existe um usuário cadastrado com este email, favor utilize outro!"
        );
      }
      if (!isValidPassword(myUser.password)) {
        throw new Error(
          "A senha deve conter pelo menos 8 caracteres. Entre eles ao menos: uma letra maiúscula, uma letra minúscula, um número."
        );
      }
      if (myUser.age < 18) {
        throw new Error("Usuários precisam ter 18 anos ou mais.");
      }
      const hash = createHash("sha256").update(myUser.password).digest("hex");
      const newUser = new User();
      newUser.name = myUser.name;
      newUser.email = myUser.email;
      newUser.password = hash;
      newUser.age = myUser.age;
      newUser.profession = myUser.profession;
      await UserRepository.save(newUser);
      const returnUser = new ReturnUser();
      returnUser.id = newUser.id;
      returnUser.name = newUser.name;
      returnUser.email = newUser.email;
      returnUser.age = newUser.age;
      returnUser.profession = newUser.profession;
      return returnUser;
    },
  },
};
