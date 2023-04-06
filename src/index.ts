import "reflect-metadata";
import { CreateDateColumn, createConnection } from "typeorm";
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

async () => {
  const connection = await createConnection({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "neves7",
    password: "arara123",
    database: "nevesl-db",
    entities: [User],
  });
};

const newUser = new User();
newUser.name = "Joe Goldberg";
newUser.id = 1234567;
await newUser.save();

start();
