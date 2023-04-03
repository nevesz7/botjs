import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
const typeDefs = `
	type Query {
		hello: String
	}
`;
const resolvers = {
  Query: {
    hello: () => "Hello Taqos!",
  },
};
const server = new ApolloServer({
  typeDefs,
  resolvers,
});
const start = async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });
  console.log("Server ready at http://localhost:4000/");
  return url;
};
start();
