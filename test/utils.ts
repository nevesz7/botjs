import axios from "axios";
import * as dotenv from "dotenv";
import { AppDataSource } from "../src/data-source";
import { server } from "../src/server";
import { GraphQLError } from "graphql";
import { startStandaloneServer } from "@apollo/server/standalone";
import { verify } from "jsonwebtoken";
import { User } from "entities/user.entity";
import { CustomError } from "../src/errors";

type UserInterface = {
  name: string;
  email: string;
  id: number;
};

const initializeTestData = async () => {
  AppDataSource.setOptions({
    url: process.env.DB_URL,
  });
  await AppDataSource.initialize();
};

export const startTest = async () => {
  dotenv.config({ path: "../bot.taq/.test.env" });
  await initializeTestData();
  await startStandaloneServer(server, {
    context: async ({ req }) => {
      const token = req.headers.authorization ?? "";
      let tokenInfo: UserInterface;
      if (token === "") return null;
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
      if (tokenInfo === null)
        throw new CustomError("Invalid Token!", 401, "random test");
      const userInterface = {
        name: tokenInfo.name,
        email: tokenInfo.email,
        id: tokenInfo.id,
      };
      return userInterface;
    },

    listen: { port: 4000 },
  });
  console.log("Server ready at http://localhost:4000/");
};

export const axiosConfig = {
  headers: {
    "content-type": "application/json; charset=utf-8",
  },
};

export const getQuery = async (queryBody) => {
  const axiosQueryConfig = {
    headers: {
      ...axiosConfig.headers,
      Authorization:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6InRlc3RlMSIsImVtYWlsIjoidGVzdGVAdGVzdGUuY29tIiwiZGF0ZU9mQmlydGgiOiIyMDAwLTAxLTAxVDAyOjAwOjAwLjAwMFoiLCJwcm9mZXNzaW9uIjoidGVzdGUiLCJpYXQiOjE2ODU1NDc0NzAsImV4cCI6MTY4NjE1MjI3MH0.ukOSOphTCH7Cs-XeSPTAuzE8acREJB0mEPeMpl9w1dc",
    },
  };
  try {
    const response = await axios.post(
      "http://localhost:4000/",
      queryBody,
      axiosQueryConfig
    );
    return response;
  } catch (error) {
    if (error.response) {
      console.log("query error at response");
    } else if (error.request) {
      console.log("query error at request");
    } else {
      console.log("unknown query error");
    }
  }
};

export const getMutation = async (mutationBody) => {
  const axiosMutationConfig = {
    headers: {
      ...axiosConfig.headers,
      Authorization:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6InRlc3RlMSIsImVtYWlsIjoidGVzdGVAdGVzdGUuY29tIiwiZGF0ZU9mQmlydGgiOiIyMDAwLTAxLTAxVDAyOjAwOjAwLjAwMFoiLCJwcm9mZXNzaW9uIjoidGVzdGUiLCJpYXQiOjE2ODU1NDc0NzAsImV4cCI6MTY4NjE1MjI3MH0.ukOSOphTCH7Cs-XeSPTAuzE8acREJB0mEPeMpl9w1dc",
    },
  };
  try {
    const response = await axios.post(
      "http://localhost:4000/",
      mutationBody,
      axiosMutationConfig
    );
    return response;
  } catch (error) {
    if (error.response) {
      console.log("mutation error at response");
    } else if (error.request) {
      console.log("mutation error at request");
    } else {
      console.log("unknown mutation error");
    }
  }
};
