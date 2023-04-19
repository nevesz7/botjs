import "mocha";
import * as dotenv from "dotenv";
import assert = require("assert");
import axios from "axios";
import { expect } from "chai";
import { AppDataSource } from "../src/data-source";
import { server } from "../src/server";
import { startStandaloneServer } from "@apollo/server/standalone";

const startTest = async () => {
  dotenv.config({ path: "../bot.taq/.test.env" });
  await initializeTestData();
  await startStandaloneServer(server, {
    listen: { port: 4000 },
  });
  console.log("Server ready at http://localhost:4000/");
};

const initializeTestData = async () => {
  AppDataSource.setOptions({
    url: process.env.DB_URL,
  });
  await AppDataSource.initialize();
};

before(async () => {
  await startTest();
});

const body = {
  query: `query {users}`,
  variables: {},
};

const axiosConfig = {
  headers: {
    "content-type": "application/json; charset=utf-8",
  },
};

const getData = async () => {
  try {
    const response = await axios.post(
      "http://localhost:4000/",
      body,
      axiosConfig
    );
    return response;
  } catch (error) {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      console.log(error.request);
    } else {
      console.log(error.message);
    }
  }
};

it("hello query returns what is expected", async () => {
  const response = await getData();
  expect(response.data.data.users).to.be.eq("Hello, Taqos!");
});
