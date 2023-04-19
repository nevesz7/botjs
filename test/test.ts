import "mocha";
import assert = require("assert");
import axios from "axios";
import { expect } from "chai";
import { start } from "../src/index";

before(async () => {
  await start();
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

it("should return true", async () => {
  assert.equal(true, true);
  const response = await getData();
  expect(response.data.data.users).to.be.eq("Hello, Taqos!");
});
