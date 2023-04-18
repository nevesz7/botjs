import { DataSource } from "typeorm";
import { user } from "./entities/user.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: "postgres://neves7:arara123@localhost:5432/nevesl-db",
  entities: [user],
  synchronize: true,
  logging: false,
});
