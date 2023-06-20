import { DataSource } from "typeorm";
import { User } from "./entities/user.entity";
import { Address } from "./entities/address-entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  entities: [User, Address],
  synchronize: true,
  logging: false,
});

export const UserRepository = AppDataSource.getRepository(User);
export const AddressRepository = AppDataSource.getRepository(Address);
