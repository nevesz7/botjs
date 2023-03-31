var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { graphql, buildSchema } = require('graphql');

//Construct a schema, using GraphQL schema language
var schema = buildSchema(`
	type Query {
		hello : String
	}
`);

// The rootValue provides a resolver function for each API endpoint
var root = {
	hello: () => {
		return 'Hello Taqos!';
	}
};

var app = express();
app.use('/graphql', graphqlHTTP({
	schema: schema,
	rootValue: root,
	graphiql: true,
}));

var print_server_start = function () {
    console.log('Running a GraphQL API server at http://localhost:4000/graphql');
};

app.listen(4000, print_server_start());

