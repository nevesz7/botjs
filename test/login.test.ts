import "mocha";
import "reflect-metadata";
import { expect } from "chai";
import { decode } from "jsonwebtoken";
import { createHash } from "crypto";
import { UserRepository } from "../src/data-source";
import { getMutation } from "./utils";

describe("login test", () => {
  beforeEach(async () => {
    await UserRepository.clear();
  });

  type DecodedTokenInfo = {
    name: string;
    email: string;
    dateOfBirth: string;
    profession: string;
    id: number;
    exp: number;
    iat: number;
  };

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
          rememberMe: true,
        },
      },
    };
    return loginBody;
  };

  const testLoginUser = {
    id: 0,
    name: input.name,
    email: input.email,
    profession: input.profession,
    dateOfBirth: new Date(2000, 0, 1).getTime().toString(),
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

    testLoginUser.id = dbUser.id;
    const mutationBody = createLoginMutation(input);
    const mutationResponse = await getMutation(mutationBody);
    expect(mutationResponse.data.data.login.user).to.deep.equal(testLoginUser);

    const mutationResponseDecodedToken = decode(
      mutationResponse.data.data.login.token
    ) as DecodedTokenInfo;
    const mutationResponseTokenInfo = {
      dateOfBirth: new Date(mutationResponseDecodedToken.dateOfBirth),
      email: mutationResponseDecodedToken.email,
      name: mutationResponseDecodedToken.name,
      profession: mutationResponseDecodedToken.profession,
      id: mutationResponseDecodedToken.id,
    };

    const testTokenInfo = {
      dateOfBirth: dbUser.dateOfBirth,
      email: dbUser.email,
      name: dbUser.name,
      profession: dbUser.profession,
      id: dbUser.id,
    };

    const compareTime = new Date().getTime() / 1000;
    expect(mutationResponseDecodedToken.iat).to.be.closeTo(compareTime, 1);
    expect(mutationResponseDecodedToken.exp).to.be.closeTo(
      compareTime + 604800,
      1
    );
    expect(mutationResponseTokenInfo).to.deep.equal(testTokenInfo);
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
});
