import "mocha";
import { expect } from "chai";
import { createHash } from "crypto";
import { UserRepository } from "../src/data-source";
import { startTest, getQuery, getMutation } from "./utils";

//basic input object for testing
let input = {
  profession: "FBI Agent",
  password: "Test1234",
  name: "test name",
  email: "test.email@test",
  dateOfBirth: "01/01/2000",
};

//starting server and connecting to test database
before(async () => {
  await startTest();
});

//deleting users from repository and resetting basic input
beforeEach(async () => {
  await UserRepository.clear();
  input = {
    profession: "FBI Agent",
    password: "Test1234",
    name: "test name",
    email: "test.email@test",
    dateOfBirth: "01/01/2000",
  };
});

//setting up usersQuery
const queryBody = {
  query: `query {users}`,
  variables: {},
};

//setting up createUserMutation
const createMutation = (input) => {
  const mutationBody = {
    query: `mutation insertUser($requestData: UserInput) {
	insertUser(requestData:$requestData) {
		name
		profession
		id
		email
		dateOfBirth
	}
  }`,
    variables: {
      requestData: {
        profession: input.profession,
        password: input.password,
        name: input.name,
        email: input.email,
        dateOfBirth: input.dateOfBirth,
      },
    },
  };
  return mutationBody;
};

//object to be used as comparison
const test = {
  id: 0,
  name: input.name,
  email: input.email,
  dateOfBirth: new Date(input.dateOfBirth),
  profession: input.profession,
};

//errors to be used as comparison
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

it("should return hello text successfully", async () => {
  const queryResponse = await getQuery(queryBody);
  expect(queryResponse.data.data.users).to.be.eq("Hello, Taqos!");
});

it("should create and return user successfully", async () => {
  const mutationBody = createMutation(input);
  const mutationResponse = await getMutation(mutationBody);
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
    dateOfBirth: test.dateOfBirth.toISOString(),
  }).to.deep.equal(mutationResponse.data.data.insertUser);
});

it("should handle email error properly", async () => {
  input.password = createHash("sha256").update(input.password).digest("hex");
  await UserRepository.save(input);
  const mutationBody = createMutation(input);
  const mutationResponse = await getMutation(mutationBody);
  expect(mutationResponse.data.errors).to.deep.equal(testError.emailError);
});

it("should handle password error properly", async () => {
  input.password = "alice";
  const mutationBody = createMutation(input);
  const mutationResponse = await getMutation(mutationBody);
  expect(mutationResponse.data.errors).to.deep.equal(testError.passwordError);
});
