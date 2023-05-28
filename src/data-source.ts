import { DataSource } from "typeorm";
import { User } from "./entities/user.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  entities: [User],
  synchronize: true,
  logging: false,
});

export const UserRepository = AppDataSource.getRepository(User);
