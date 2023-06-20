import "reflect-metadata";
import * as dotenv from "dotenv";
import { startStandaloneServer } from "@apollo/server/standalone";
import { AppDataSource } from "./data-source";
import { getContext, server } from "../src/server";

import { AddressRepository, UserRepository } from "./data-source";

const start = async () => {
  dotenv.config({ path: "./.env" });
  await initializeData();
  await startStandaloneServer(server, {
    context: getContext,
    listen: { port: 4000 },
  });
  await add_addresses();
  console.log("Server ready at http://localhost:4000/");
};

const initializeData = async () => {
  AppDataSource.setOptions({
    url: process.env.DB_URL,
  });
  await AppDataSource.initialize();
};

const add_addresses = async () => {
  const address = {
    name: "home",
    CEP: "01234567",
    street: "test street 1",
    streetNumber: 42,
    complement: null,
    neighborhood: "downtown",
    city: "test city 1",
    state: "test state 1",
    user: await UserRepository.findOne({
      where: { email: "Chaz41@hotmail.com" },
    }),
  };
  await AddressRepository.save(address);
  address.name = "work";
  address.CEP = "23456789";
  address.street = "test street 2";
  await AddressRepository.save(address);
};

start();
