import "reflect-metadata";
import * as dotenv from "dotenv";
import { AppDataSource } from "./data-source";
import { fillDatabase } from "./utils";

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

const fill = async (amount: number) => {
  await startDB();
  fillDatabase(amount);
};

fill(100);
