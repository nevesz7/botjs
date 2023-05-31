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
