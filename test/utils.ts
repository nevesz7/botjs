import axios from "axios";
import * as dotenv from "dotenv";
import { startStandaloneServer } from "@apollo/server/standalone";
import { getContext, server } from "../src/server";
import { AppDataSource } from "../src/data-source";

const initializeTestData = async () => {
  AppDataSource.setOptions({
    url: process.env.DB_URL,
  });
  await AppDataSource.initialize();
};

export const startTest = async () => {
  dotenv.config({ path: "./.test.env" });
  await initializeTestData();
  await startStandaloneServer(server, {
    context: getContext,
    listen: { port: 4000 },
  });
  console.log("Server ready at http://localhost:4000/");
};

export const axiosConfig = {
  headers: {
    "content-type": "application/json; charset=utf-8",
  },
};

export const getQuery = async (queryBody, token: string) => {
  const axiosQueryConfig = {
    headers: {
      ...axiosConfig.headers,
      Authorization: token,
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
      return error.response;
    } else if (error.request) {
      console.log("query error at request");
    } else {
      console.log("unknown query error");
    }
  }
};

export const getMutation = async (mutationBody, token: string) => {
  const axiosMutationConfig = {
    headers: {
      ...axiosConfig.headers,
      Authorization: token,
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
      return error.response;
    } else if (error.request) {
      console.log("mutation error at request");
    } else {
      console.log("unknown mutation error");
    }
  }
};
