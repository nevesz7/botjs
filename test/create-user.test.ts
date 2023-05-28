import "mocha";
import "reflect-metadata";
import { expect } from "chai";
import { createHash } from "crypto";
import { UserRepository } from "../src/data-source";
import { getQuery, getMutation } from "./utils";
import { getToken } from "../src/token";

describe("create user test", () => {
  //basic input object for testing
  let input = {
    profession: "teste",
    password: "Teste123",
    name: "teste1",
    email: "teste@teste.com",
    dateOfBirth: "01/01/2000",
  };
  let token = "";

  //deleting users from repository and resetting basic input
  beforeEach(async () => {
    await UserRepository.clear();
    input = {
      profession: "teste",
      password:
        "ebdf496f67651cddf6aaa1f0b130f1b99ce9e2e93dc2503d926edcff15aee668",
      name: "teste1",
      email: "teste@teste.com",
      dateOfBirth: "01/01/2000",
    };
    await UserRepository.save(input);

    const existingUser = await UserRepository.findOneBy({
      email: "teste@teste.com",
    });
    const testUser = {
      profession: existingUser.profession,
      name: existingUser.name,
      dateOfBirth: existingUser.dateOfBirth,
      email: existingUser.email,
      id: existingUser.id,
    };
    token = getToken(testUser, true);

    input = {
      profession: "teste2",
      password: "Teste123",
      name: "teste2",
      email: "teste2@teste.com",
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
      query: `mutation insertUser($requestData: Input) {
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
          userInput: {
            profession: input.profession,
            password: input.password,
            name: input.name,
            email: input.email,
            dateOfBirth: input.dateOfBirth,
          },
          token: token,
        },
      },
    };
    return mutationBody;
  };

  //object to be used as comparison
  const test = {
    id: 0,
    profession: "teste2",
    name: "teste2",
    email: "teste2@teste.com",
    dateOfBirth: new Date("01/01/2000"),
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
      id: mutationResponse.data.data.insertUser.id,
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
    input.email = "teste@teste.com";
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
});
