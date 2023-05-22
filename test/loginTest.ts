import "mocha";
import { expect } from "chai";
import { createHash } from "crypto";
import { UserRepository } from "../src/data-source";
import { getMutation } from "./utils";

const input = {
  profession: "test profession",
  password: "Test1234",
  name: "test name",
  email: "test.email@test",
  dateOfBirth: "01/01/2000",
};

const createLoginMutation = (input) => {
  const loginBody = {
    query: `mutation login($requestCredentials: LoginInfo) {
			  login(requestCredentials:$requestCredentials) {
				  user {
					  profession
					  name
					  id
					  dateOfBirth
					  email
				  }
				  token
			  }
		  }`,
    variables: {
      requestCredentials: {
        password: input.password,
        email: input.email,
      },
    },
  };
  return loginBody;
};

const test = {
  data: {
    login: {
      user: {
        id: 0,
        name: input.name,
        email: input.email,
        profession: input.profession,
        dateOfBirth: new Date(input.dateOfBirth).toISOString(),
      },
      token: "the_token",
    },
  },
};

const testError = {
  passwordError: [
    {
      code: 403,
      message: "Senha inválida!",
    },
  ],

  emailError: [
    {
      code: 404,
      message: "Email não encontrado na base de dados, tente novamente.",
    },
  ],
};

it("should execute login mutation and return successfully", async () => {
  const dbUser = await UserRepository.save({
    ...input,
    password: createHash("sha256").update(input.password).digest("hex"),
    dateOfBirth: new Date(input.dateOfBirth),
  });
  test.data.login.user.id = dbUser.id;
  const mutationBody = createLoginMutation(input);
  const mutationResponse = await getMutation(mutationBody);
  expect(mutationResponse.data).to.deep.equal(test);
});

it("should detect non-existing user and fail the login mutation", async () => {
  await UserRepository.save(input);
  input.email = "error@email.com";
  const mutationBody = createLoginMutation(input);
  const mutationResponse = await getMutation(mutationBody);
  expect(mutationResponse.data.errors).to.deep.equal(testError.emailError);
});

it("should detect wrong password and fail the login mutation", async () => {
  await UserRepository.save(input);
  input.password = "TestError";
  const mutationBody = createLoginMutation(input);
  const mutationResponse = await getMutation(mutationBody);
  expect(mutationResponse.data.errors).to.deep.equal(testError.passwordError);
});
