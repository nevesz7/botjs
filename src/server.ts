import { unwrapResolverError } from "@apollo/server/errors";
import { ApolloServer } from "@apollo/server";
import { resolvers } from "./resolvers";
import { typeDefs } from "./schema";
import { CustomError } from "./errors";
import { GraphQLError } from "graphql";

type UserInterface = {
  name: string;
  email: string;
  id: number;
};

export const server = new ApolloServer<UserInterface>({
  typeDefs,
  resolvers,
  formatError: (formattedError, error) => {
    const userError = unwrapResolverError(error);

    if (userError instanceof CustomError) {
      return { ...userError, message: userError.message };
    }

    if (userError instanceof GraphQLError) {
      console.log("==========");
      console.log(userError);
      const customError = {
        message: userError.message,
        code: userError.extensions.status,
      };
      return customError;
    }

    return formattedError;
  },
});
