import "mocha";
import assert = require("assert");
import axios from "axios";
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
    console.log("response:");
    console.log(response);
    return response;
  } catch (error) {
    if (error.response) {
      console.log("error1");
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      console.log("error2");
      console.log(error.request);
    } else {
      console.log("Error3", error.message);
    }
  }
};

console.log("hello");

it("should return true", async () => {
  assert.equal(true, true);
  await getData();
});
