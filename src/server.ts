import { unwrapResolverError } from "@apollo/server/errors";
import { ApolloServer } from "@apollo/server";
import { resolvers } from "./resolvers";
import { typeDefs } from "./schema";
import { CustomError } from "./errors";

export const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (formattedError, error) => {
    const userError = unwrapResolverError(error);
    if (userError instanceof CustomError) {
      return { ...userError, message: userError.message };
    }
    return formattedError;
  },
});
