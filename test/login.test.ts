import "mocha";
import { expect } from "chai";
import { decode } from "jsonwebtoken";
import { createHash } from "crypto";
import { UserRepository } from "../src/data-source";
import { getMutation } from "./utils";
import { getToken } from "../src/token";
import { UserPayload, UserInput } from "../src/types";

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

  const testUserData: UserInput = {
    profession: "test profession",
    password: "Test1234",
    name: "test name",
    email: "test.email@test",
    dateOfBirth: "01/01/2000",
  };

  const createLoginMutation = (testUserData: UserInput) => {
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
          password: testUserData.password,
          email: testUserData.email,
          rememberMe: true,
        },
      },
    };
    return loginBody;
  };

  const testLoginUser: UserPayload = {
    id: 0,
    name: testUserData.name,
    email: testUserData.email,
    profession: testUserData.profession,
    dateOfBirth: new Date(2000, 0, 1),
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
      ...testUserData,
      password: createHash("sha256")
        .update(testUserData.password)
        .digest("hex"),
      dateOfBirth: new Date(testUserData.dateOfBirth),
    });

    testLoginUser.id = dbUser.id;
    testLoginUser.dateOfBirth = new Date(testLoginUser.dateOfBirth);
    const mutationBody = createLoginMutation(testUserData);
    const mutationResponse = await getMutation(
      mutationBody,
      getToken(testLoginUser, true)
    );
    expect(mutationResponse.data.data.login.user).to.deep.equal({
      ...testLoginUser,
      dateOfBirth: new Date(testLoginUser.dateOfBirth).getTime().toString(),
    });

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

    expect(mutationResponseTokenInfo).to.deep.equal(testTokenInfo);
    const compareTime = new Date().getTime() / 1000;
    expect(mutationResponseDecodedToken.iat).to.be.closeTo(compareTime, 1);
    expect(mutationResponseDecodedToken.exp).to.be.closeTo(
      compareTime + 604800,
      1
    );
  });

  it("should execute login mutation and return correct token with rememberMe as false", async () => {
    const dbUser = await UserRepository.save({
      ...testUserData,
      password: createHash("sha256")
        .update(testUserData.password)
        .digest("hex"),
      dateOfBirth: new Date(testUserData.dateOfBirth),
    });

    testLoginUser.id = dbUser.id;
    const mutationBody = createLoginMutation(testUserData);
    mutationBody.variables.requestCredentials.rememberMe = false;
    const mutationResponse = await getMutation(
      mutationBody,
      getToken(testLoginUser, true)
    );

    const mutationResponseDecodedToken = decode(
      mutationResponse.data.data.login.token
    ) as DecodedTokenInfo;

    const compareTime = new Date().getTime() / 1000;
    expect(mutationResponseDecodedToken.exp).to.be.closeTo(
      compareTime + 3600,
      1
    );
  });

  it("should detect non-existing user and fail the login mutation", async () => {
    await UserRepository.save(testUserData);
    const dbUser = await UserRepository.findOne({
      where: { email: testUserData.email },
    });
    testUserData.email = "error@email.com";
    const mutationBody = createLoginMutation(testUserData);
    const mutationResponse = await getMutation(
      mutationBody,
      getToken(dbUser, true)
    );
    expect(mutationResponse.data.errors).to.deep.equal(testError.emailError);
  });

  it("should detect wrong password and fail the login mutation", async () => {
    await UserRepository.save(testUserData);
    const dbUser = await UserRepository.findOne({
      where: { email: testUserData.email },
    });
    testUserData.password = "TestError";
    const mutationBody = createLoginMutation(testUserData);
    const mutationResponse = await getMutation(
      mutationBody,
      getToken(dbUser, true)
    );
    expect(mutationResponse.data.errors).to.deep.equal(testError.passwordError);
  });
});
