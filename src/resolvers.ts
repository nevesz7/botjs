import { AppDataSource } from "./dataSource";
import { User } from "./entities/user";

const UserRepository = AppDataSource.getRepository(User);

export const resolvers = {
  Query: {
    users: () => "Hello Taqos!",
  },
  Mutation: {
    insertUser: async (_, { name, email, password, age, profession }) => {
      const newUser = new User();
      newUser.name = name;
      newUser.email = email;
      newUser.password = password;
      newUser.age = age;
      newUser.profession = profession;
      await UserRepository.save(newUser);
      return newUser;
    },
  },
};
