import axios from "axios";
import * as dotenv from "dotenv";
import { AppDataSource } from "../src/data-source";
import { server } from "../src/server";
import { startStandaloneServer } from "@apollo/server/standalone";

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
  try {
    const response = await axios.post(
      "http://localhost:4000/",
      queryBody,
      axiosConfig
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
  try {
    const response = await axios.post(
      "http://localhost:4000/",
      mutationBody,
      axiosConfig
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
