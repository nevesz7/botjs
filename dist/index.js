import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
const typeDefs = `
	type String {
		title: String
		string: String
	}
	type Query {
		strings: [String]
	}
`;
const strings = [
    {
        title: 'hello',
        string: 'Hello Taqos',
    },
    {
        title: 'server',
        string: 'apollo',
    },
];
const resolvers = {
    Query: {
        strings: () => strings,
    },
};
const server = new ApolloServer({
    typeDefs,
    resolvers,
});
const start = async () => {
    const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });
    console.log("Server ready at http://localhost:4000/");
};
start();
