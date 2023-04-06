import "reflect-metadata";
import { DataSource } from "typeorm";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { User } from "./entities/user";

const typeDefs = `
	type Query {
		hello: String
	}
`;

const resolvers = {
  Query: { hello: () => "Hello Taqos!" },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const start = async () => {
  await startStandaloneServer(server, {
    listen: { port: 4000 },
  });
  console.log("Server ready at http://localhost:4000/");
};

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "neves7",
  password: "arara123",
  database: "nevesl-db",
  entities: [User],
  synchronize: true,
  logging: false,
});

const initializeData = async () => {
  await AppDataSource.initialize();
};

const UserRepository = AppDataSource.getRepository(User);

const createUser = async () => {
  await initializeData();
  const newUser = new User();
  newUser.name = "Joe Goldberg";
  newUser.age = 30;
  newUser.profession = "Librarian";
  await UserRepository.save(newUser);
  console.log(
    `User: ${newUser.name} has been succesfully created! User id is`,
    newUser.id
  );
};

start();
createUser();
