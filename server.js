import express = from "express";
import { graphqlHTTP } from "@express-graphql";
import { graphql, buildSchema } from "@graphql";

//Construct a schema, using GraphQL schema language
const schema = buildSchema(`
	type Query {
		hello : String
	}
`);

// The rootValue provides a resolver function for each API endpoint
const root = {
  hello: () => {
    return "Hello Taqos!";
  },
};

const app = express();
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

const printServerStart = function () {
  console.log("Running a GraphQL API server at http://localhost:4000/graphql");
};

app.listen(4000, printServerStart);
