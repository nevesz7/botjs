import "reflect-metadata";
import * as dotenv from "dotenv";
import { startStandaloneServer } from "@apollo/server/standalone";
import { AppDataSource } from "./data-source";
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

start();
