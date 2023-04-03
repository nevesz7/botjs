import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
const typeDefs = `
	type Book {
		title: String
		author: String
	}
	type Query {
		books: [Book]
	}
`;
const books = [
    {
        title: 'Eragon',
        author: 'Chistopher Paolini',
    },
    {
        title: 'Golden Compass',
        author: 'Philip Pullman'
    },
    {
        title: 'Maze Runner',
        author: 'James Dashner',
    },
];
const resolvers = {
    Query: {
        books: () => books,
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
