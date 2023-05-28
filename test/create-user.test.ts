import "mocha";
import { expect } from "chai";
import { createHash } from "crypto";
import { UserRepository } from "../src/data-source";
import { getMutation } from "./utils";
import { getToken } from "../src/token";

describe("create user test", () => {
  type MutationInput = {
    profession: string;
    password: string;
    name: string;
    email: string;
    dateOfBirth: string;
  };

  //basic input object for testing
  let mutationInput: MutationInput;
  let token: string;

  //deleting users from repository and resetting basic input
  beforeEach(async () => {
    await UserRepository.clear();
    mutationInput = {
      profession: "teste",
      password:
        "ebdf496f67651cddf6aaa1f0b130f1b99ce9e2e93dc2503d926edcff15aee668",
      name: "teste1",
      email: "teste@teste.com",
      dateOfBirth: "01/01/2000",
    };
    await UserRepository.save(mutationInput);

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

    mutationInput = {
      profession: "teste2",
      password: "Teste123",
      name: "teste2",
      email: "teste2@teste.com",
      dateOfBirth: "01/01/2000",
    };
  });

  //setting up createUserMutation
  const createMutation = (mutationInput: MutationInput) => {
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
          userInput: mutationInput,
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

  it("should create and return user successfully", async () => {
    const mutationBody = createMutation(mutationInput);
    const mutationResponse = await getMutation(mutationBody);
    const dbUser = await UserRepository.findOneBy({
      id: mutationResponse.data.data.insertUser.id,
    });
    test.id = dbUser.id;
    expect({
      ...test,
      password: createHash("sha256")
        .update(mutationInput.password)
        .digest("hex"),
    }).to.deep.equal(dbUser);

    expect({
      ...test,
      dateOfBirth: test.dateOfBirth.toISOString(),
    }).to.deep.equal(mutationResponse.data.data.insertUser);
  });

  it("should throw error if user with email already exists", async () => {
    mutationInput.email = "teste@teste.com";
    const mutationBody = createMutation(mutationInput);
    const mutationResponse = await getMutation(mutationBody);
    expect(mutationResponse.data.errors).to.deep.equal(testError.emailError);
  });

  it("should throw error if password doesn't follow password rules", async () => {
    mutationInput.password = "test";
    const mutationBody = createMutation(mutationInput);
    const mutationResponse = await getMutation(mutationBody);
    expect(mutationResponse.data.errors).to.deep.equal(testError.passwordError);
  });
});
