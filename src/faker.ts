import "reflect-metadata";
import * as dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import { createHash } from "crypto";
import { DatabaseUser } from "./types";
import { AppDataSource } from "./data-source";
import { UserRepository } from "./data-source";
import { startStandaloneServer } from "@apollo/server/standalone";
import { getContext, server } from "../src/server";

const start = async () => {
  dotenv.config({ path: "./.env" });
  await initializeData();
  await startStandaloneServer(server, {
    context: getContext,
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

const fillDatabase = async (numberOfUsers: number) => {
  const userArray: DatabaseUser[] = new Array(numberOfUsers);
  for (let counter = 0; counter < numberOfUsers; counter++) {
    userArray[counter] = generateRandomUser();
  }
  await UserRepository.insert(userArray);
};

const generateRandomUser = () => {
  const newUser: DatabaseUser = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: createHash("sha256")
      .update(
        faker.internet.password({
          length: 10,
          pattern: /[A-Za-z\d]/,
          prefix: "aA1",
        })
      )
      .digest("hex"),
    profession: faker.person.jobDescriptor(),
    dateOfBirth: faker.date.birthdate(),
  };
  return newUser;
};

const fill = async () => {
  await start();
  fillDatabase(100);
};

fill();
