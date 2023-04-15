import { DataSource } from "typeorm";
import { User } from "./entities/user";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: "postgres://neves7:arara123@localhost:5432/nevesl-db",
  entities: [User],
  synchronize: true,
  logging: false,
});
