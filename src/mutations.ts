import { AppDataSource } from "./dataSource";
import { User } from "./entities/user";
import { initializeData } from "./index";

const UserRepository = AppDataSource.getRepository(User);

export const insertUser = {
  createUser: async (
    name: string,
    email: string,
    password: string,
    age: number,
    profession: string
  ) => {
    await initializeData();
    const newUser = new User();
    newUser.name = name;
    newUser.email = email;
    newUser.age = age;
    newUser.profession = profession;
    await UserRepository.save(newUser);
    console.log(
      `User: ${newUser.name} has been succesfully created! User id is`,
      newUser.id
    );
  },
};
