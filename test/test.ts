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
      console.log("query error at response");
    } else if (error.request) {
      console.log("query error at request");
    } else {
      console.log("unknown query error");
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
      console.log("mutation error at response");
    } else if (error.request) {
      console.log("mutation error at request");
    } else {
      console.log("unknown mutation error");
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

it("should return true", async () => {
  const queryResponse = await getData();
  expect(queryResponse.data.data.users).to.be.eq("Hello, Taqos!");
});

it("should create and return user successfully", async () => {
  UserRepository.clear();
  const mutationResponse = await getMutation();
  const dbUser = await UserRepository.findOneBy({
    id: mutationResponse.data.id,
  });
  test.id = dbUser.id;
  expect({
    ...test,
    password: createHash("sha256").update(input.password).digest("hex"),
  }).to.deep.equal(dbUser);

  expect({
    ...test,
    date_of_birth: test.date_of_birth.toISOString(),
  }).to.deep.equal(mutationResponse.data.data.insertUser);
});

// mutationBody.variables.requestData.password = "alice";
// mutationBody.variables.requestData.email = "alicekrugger@gmail.com";
// const getMutationError = async () => {
//   try {
//     const response = await axios.post(
//       "http://localhost:4000/",
//       mutationBody,
//       axiosConfig
//     );
//     return response;
//   } catch (error) {
//     if (error.response) {
//       console.log("mutation error at response");
//     } else if (error.request) {
//       console.log("mutation error at request");
//     } else {
//       console.log("unknown mutation error");
//     }
//   }
// };

const testError = {
  passwordError: [
    {
      code: 400,
      message:
        "A senha deve conter pelo menos 8 caracteres. Entre eles ao menos: uma letra maiúscula, uma letra minúscula e um número.",
      additionalInfo: "A senha não satisfaz a política de senha!",
    },
  ],

  emailError: [
    {
      code: 409,
      message:
        "Já existe um usuário cadastrado com este email, favor utilize outro!",
      additionalInfo: "Email já existente na base de dados",
    },
  ],
};

it("should handle errors properly", async () => {
  let mutationResponse = await getMutation();
  expect(mutationResponse.data.errors).to.deep.equal(testError.emailError);
  mutationBody.variables.requestData.password = "alice";
  mutationResponse = await getMutation();
  expect(mutationResponse.data.errors).to.deep.equal(testError.passwordError);
});
