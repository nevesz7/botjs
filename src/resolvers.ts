import { AppDataSource } from "./dataSource";
import { User } from "./entities/user";

const UserRepository = AppDataSource.getRepository(User);

const containsUppercase = (str) => {
  return /[A-Z]/.test(str);
};
const containsLowercase = (str) => {
  return /[a-z]/.test(str);
};
const isValidPassword = (str) => {
  return containsLowercase(str), containsUppercase(str), str.length > 7;
};

export const resolvers = {
  Query: {
    users: () => "Hello Taqos!",
  },
  Mutation: {
    insertUser: async (_, { UserInput }) => {
      const existingUser = await UserRepository.findOneBy({
        email: UserInput.email,
      });
      if (existingUser) {
        throw new Error(
          "Já existe um usuário cadastrado com este email, favor utilize outro!"
        );
      }
      if (!isValidPassword(UserInput.password)) {
        throw new Error(
          "A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula e mais de 8 números."
        );
      }
      const newUser = new User();
      newUser.name = UserInput.name;
      newUser.email = UserInput.email;
      newUser.password = UserInput.password;
      newUser.age = UserInput.age;
      newUser.profession = UserInput.profession;
      await UserRepository.save(newUser);
      return newUser;
    },
  },
};
