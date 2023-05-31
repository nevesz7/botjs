import "reflect-metadata";
import * as dotenv from "dotenv";
import { startStandaloneServer } from "@apollo/server/standalone";
import { AppDataSource } from "./data-source";
import { verify } from "jsonwebtoken";
import { server } from "../src/server";
import { User } from "entities/user.entity";
import { GraphQLError } from "graphql";
import { CustomError } from "../src/errors";

type UserInterface = {
  name: string;
  email: string;
  id: number;
};

const start = async () => {
  dotenv.config({ path: "../bot.taq/.env" });
  await initializeData();
  await startStandaloneServer(server, {
    context: async ({ req }) => {
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
      if (tokenInfo === null) {
        throw new CustomError("Invalid Token!", 401, "random test");
      }
      
      return {
        name: tokenInfo.name,
        email: tokenInfo.email,
        id: tokenInfo.id,
      }
    },

    listen: { port: 4000 },
  });
  console.log("Server ready at http://localhost:4000/");
};

const initializeData = async () => {
  AppDataSource.setOptions({
    url: process.env.DB_URL,
  });
  await AppDataSource.initialize();
};

start();
