import { ApolloServer } from "@apollo/server";
import { unwrapResolverError } from "@apollo/server/errors";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { CustomError } from "./errors";
import { GraphQLError } from "graphql";
import { verify } from "jsonwebtoken";
import { UserRepository } from "../src/data-source";
import { User } from "../src/entities/user.entity";

type UserInterface = {
  id: number;
};

export const getContext = async ({ req }) => {
  const token = req.headers.authorization ?? "";
  if (token === "") {
    return null;
  }

  let tokenInfo: UserInterface;
  try {
    tokenInfo = verify(token, process.env.SECRET) as User;
  } catch (error) {
    throw new GraphQLError("User is not authenticated", {
      extensions: {
        code: "UNAUTHENTICATED",
        status: 401,
      },
    });
  }
  let dbUser;
  if (tokenInfo.id) {
    dbUser = await UserRepository.findOne({
      where: { id: tokenInfo.id },
    });
  }
  if (tokenInfo === null || !dbUser) {
    throw new GraphQLError("User is not authenticated", {
      extensions: {
        code: "UNAUTHENTICATED",
        status: 401,
      },
    });
  }

  return {
    id: tokenInfo.id,
  };
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
      return {
        message: userError.message,
        code: userError.extensions.status,
      };
    }

    return formattedError;
  },
});
