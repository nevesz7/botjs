import "mocha";
import * as dotenv from "dotenv";
import axios from "axios";
import { expect } from "chai";
import { createHash } from "crypto";
import { server } from "../src/server";
import { AppDataSource } from "../src/data-source";
import { UserRepository } from "../src/data-source";
import { startStandaloneServer } from "@apollo/server/standalone";

const input = {
  profession: "FBI Agent",
  password: "AliceKrugger7",
  name: "Jane Doe",
  email: "janedoe@fbi.gov",
  date_of_birth: "09/10/1984",
};

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
      profession: input.profession,
      password: input.password,
      name: input.name,
      email: input.email,
      date_of_birth: input.date_of_birth,
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

const test = {
  id: 0,
  name: input.name,
  email: input.email,
  date_of_birth: new Date(input.date_of_birth),
  profession: input.profession,
};

it("query return match the expected", async () => {
  const queryResponse = await getData();
  expect(queryResponse.data.data.users).to.be.eq("Hello, Taqos!");
  console.log("Query users returns the expected!");
});

it("mutation return matches the expected", async () => {
  const mutationResponse = await getMutation();
  const dbUser = await UserRepository.findOneBy({
    id: mutationResponse.data.id,
  });
  test.id = dbUser.id;
  expect({
    ...test,
    password: createHash("sha256").update(input.password).digest("hex"),
  }).to.deep.equal(dbUser);
  console.log("Database user matches the expected!");
  expect({
    ...test,
    date_of_birth: test.date_of_birth.toISOString(),
  }).to.deep.equal(mutationResponse.data.data.insertUser);
  console.log("insertUser mutation returns the expected!");
  UserRepository.delete({ id: dbUser.id });
});
