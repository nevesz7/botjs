import "mocha";
import * as dotenv from "dotenv";
import axios from "axios";
import assert = require("assert");
import { expect } from "chai";
import { User } from "../src/entities/user.entity";
import { createHash } from "crypto";
import { server } from "../src/server";
import { AppDataSource } from "../src/data-source";
import { UserRepository } from "../src/resolvers";
import { startStandaloneServer } from "@apollo/server/standalone";

//insert-prefix
const profession = "FBI Agent";
const password = "AliceKrugger7";
const name = "Jane Doe";
const email = "janedoe@fbi.gov";
const date_of_birth = "09/10/1984";

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

const queryBody = {
  query: `query {users}`,
  variables: {},
};

const mutationBody = {
  query: `mutation insertUser($requestData: UserInput) {
	insertUser(requestData:$requestData) {
		name
		profession
		id
		email
		date_of_birth
	}
  }`,
  variables: {
    requestData: {
      profession: "FBI Agent",
      password: "AliceKrugger7",
      name: "Jane Doe",
      email: "janedoe@fbi.gov",
      date_of_birth: "09/10/1984",
    },
  },
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
      queryBody,
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

const getMutation = async () => {
  try {
    const response = await axios.post(
      "http://localhost:4000/",
      mutationBody,
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

const testDBUser = new User();
testDBUser.id = 0;
testDBUser.name = name;
testDBUser.email = email;
testDBUser.password = createHash("sha256").update(password).digest("hex");
testDBUser.date_of_birth = new Date(date_of_birth);
testDBUser.profession = profession;

const testReturn = {
  id: 0,
  name: name,
  email: email,
  profession: profession,
  date_of_birth: testDBUser.date_of_birth.toISOString(),
};

//change to multiple tests (3 passing instead of 1 passing)
it("query and mutation returns match the expected", async () => {
  const queryResponse = await getData();
  const mutationResponse = await getMutation();
  const dbUser = await UserRepository.findOneBy({
    id: mutationResponse.data.id,
  });
  testDBUser.id = dbUser.id;
  testReturn.id = dbUser.id;
  expect(queryResponse.data.data.users).to.be.eq("Hello, Taqos!");
  console.log("Query users returns the expected!");
  assert.deepEqual(testDBUser, dbUser);
  console.log("Database user matches the expected!");
  assert.deepEqual(testReturn, mutationResponse.data.data.insertUser);
  console.log("insertUser mutation returns the expected!");
  UserRepository.delete({ id: dbUser.id });
});
