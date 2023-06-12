import "reflect-metadata";
import * as dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import { generateHash } from "./utils";
import { DatabaseUser } from "./types";
import { AppDataSource } from "./data-source";
import { UserRepository } from "./data-source";

const startDB = async () => {
  dotenv.config({ path: "./.env" });
  await initializeData();
};

const initializeData = async () => {
  AppDataSource.setOptions({
    url: process.env.DB_URL,
  });
  await AppDataSource.initialize();
};

const fillDatabase = async (numberOfUsers: number) => {
  const userArray: DatabaseUser[] = [];
  for (let counter = 0; counter < numberOfUsers; counter++) {
    userArray.push(generateRandomUser());
  }
  await UserRepository.insert(userArray);
};

const generateRandomUser = () => {
  const newUser: DatabaseUser = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: generateHash(
      faker.internet.password({
        length: 10,
        pattern: /[A-Za-z\d]/,
        prefix: "aA1",
      })
    ),
    profession: faker.person.jobDescriptor(),
    dateOfBirth: faker.date.birthdate(),
  };
  return newUser;
};

const fill = async () => {
  await startDB();
  fillDatabase(100);
};

fill();
