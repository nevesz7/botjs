import { AppDataSource } from "./data-source";
import { User } from "./entities/user";

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
          "A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula e mais de 8 números."
        );
      }
      const newUser = new User();
      newUser.name = myUser.name;
      newUser.email = myUser.email;
      newUser.password = myUser.password;
      newUser.age = myUser.age;
      newUser.profession = myUser.profession;
      await UserRepository.save(newUser);
      return newUser;
    },
  },
};
