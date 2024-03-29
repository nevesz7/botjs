import "mocha";
import { expect } from "chai";
import { generateHash } from "../src/utils";
import { AddressRepository, UserRepository } from "../src/data-source";
import { getMutation } from "./utils";
import { getToken } from "../src/token";

describe("create user test", () => {
  type UserInput = {
    profession: string;
    password: string;
    name: string;
    email: string;
    dateOfBirth: string;
  };

  //basic input object for testing
  let mutationInput: UserInput;

  //deleting users from repository and resetting basic input
  beforeEach(async () => {
    await AddressRepository.delete({});
    await UserRepository.delete({});
    mutationInput = {
      profession: "teste",
      password:
        "ebdf496f67651cddf6aaa1f0b130f1b99ce9e2e93dc2503d926edcff15aee668",
      name: "teste1",
      email: "teste@teste.com",
      dateOfBirth: "01/01/2000",
    };
    await UserRepository.save(mutationInput);

    mutationInput = {
      profession: "teste2",
      password: "Teste123",
      name: "teste2",
      email: "teste2@teste.com",
      dateOfBirth: "01/01/2000",
    };
  });

  //setting up createUserMutation
  const createInsertUserMutation = (mutationInput: UserInput) => {
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
        requestData: mutationInput,
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
    let dbUser = await UserRepository.findOne({
      where: { email: "teste@teste.com" },
    });
    const mutationBody = createInsertUserMutation(mutationInput);
    const mutationResponse = await getMutation(
      mutationBody,
      getToken(dbUser, true)
    );
    dbUser = await UserRepository.findOne({
      where: { id: mutationResponse.data.data.insertUser.id },
    });
    test.id = dbUser.id;
    expect({
      ...test,
      password: generateHash(mutationInput.password),
    }).to.deep.equal(dbUser);

    expect({
      ...test,
      dateOfBirth: test.dateOfBirth.toISOString(),
    }).to.deep.equal(mutationResponse.data.data.insertUser);
  });

  it("should fail the mutation due to not being authenticated", async () => {
    const mutationBody = createInsertUserMutation(mutationInput);
    const mutationResponse = await getMutation(mutationBody, "invalid-token");
    const testErrorArray = [
      {
        message: "User is not authenticated",
        code: 401,
      },
    ];
    expect(mutationResponse.data.errors).to.deep.equal(testErrorArray);
  });

  it("should throw error if user with email already exists", async () => {
    mutationInput.email = "teste@teste.com";
    const dbUser = await UserRepository.findOne({
      where: { email: "teste@teste.com" },
    });
    const mutationBody = createInsertUserMutation(mutationInput);
    const mutationResponse = await getMutation(
      mutationBody,
      getToken(dbUser, true)
    );
    expect(mutationResponse.data.errors).to.deep.equal(testError.emailError);
  });

  it("should throw error if password doesn't follow password rules", async () => {
    mutationInput.password = "testTEST";
    const dbUser = await UserRepository.findOne({
      where: { email: "teste@teste.com" },
    });
    const mutationBody = createInsertUserMutation(mutationInput);
    const mutationResponse = await getMutation(
      mutationBody,
      getToken(dbUser, true)
    );
    expect(mutationResponse.data.errors).to.deep.equal(testError.passwordError);
  });
});
