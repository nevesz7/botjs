import "reflect-metadata";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { AppDataSource } from "./dataSource";

const typeDefs = `
	type Query {
		hello: String
	}
`;

export const resolvers = {
  Query: { hello: () => "Hello Taqos!" },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const start = async () => {
  await initializeData();
  await startStandaloneServer(server, {
    listen: { port: 4000 },
  });
  console.log("Server ready at http://localhost:4000/");
};

export const initializeData = async () => {
  await AppDataSource.initialize();
};

start();
