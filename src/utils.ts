import { faker } from "@faker-js/faker";
import { DatabaseUser } from "../src/types";
import { UserRepository } from "../src/data-source";
import { createHash } from "crypto";

export const generateHash = (password: string) => {
  return createHash("sha256").update(password).digest("hex");
};

export const fillDatabase = async (numberOfUsers: number) => {
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
    address: [],
  };
  return newUser;
};
